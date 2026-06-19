import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

export async function POST(req: Request) {
  const { items, email, address } = await req.json()

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Carrello vuoto" }, { status: 400 })
  }

  const customerEmail = email
  if (!customerEmail) {
    return NextResponse.json({ error: "Email richiesta per il checkout" }, { status: 400 })
  }

  const productIds = items.map((i: { productId: string }) => i.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, published: true },
  })

  const productMap = new Map(products.map((p) => [p.id, p]))

  for (const item of items) {
    const product = productMap.get(item.productId)
    if (!product) {
      return NextResponse.json({
        error: `Prodotto non trovato`,
      }, { status: 400 })
    }
    if (product.stock < item.quantity) {
      return NextResponse.json({
        error: `Stock insufficiente per ${product.name} (disponibili: ${product.stock})`,
      }, { status: 400 })
    }
  }

  const subtotal = items.reduce(
    (acc: number, item: { productId: string; quantity: number }) => {
      const product = productMap.get(item.productId)!
      return acc + product.price * item.quantity
    },
    0
  )
  const tax = Math.round(subtotal * 0.22)

  const lineItems = items.map((item: { productId: string; quantity: number }) => {
    const product = productMap.get(item.productId)!
    return {
      price_data: {
        currency: "eur",
        product_data: {
          name: product.name,
          images: product.images,
        },
        unit_amount: product.price,
      },
      quantity: item.quantity,
    }
  })

  lineItems.push({
    price_data: {
      currency: "eur",
      product_data: { name: "IVA 22%", images: [] },
      unit_amount: tax,
    },
    quantity: 1,
  })

  const metadata: Record<string, string> = {
    guestEmail: customerEmail,
    items: JSON.stringify(items.map((i: { productId: string; quantity: number }) => ({ productId: i.productId, quantity: i.quantity }))),
  }

  if (address) {
    metadata.shippingAddress = JSON.stringify({
      firstName: address.firstName || "",
      lastName: address.lastName || "",
      company: address.company || "",
      address: address.address || "",
      address2: address.address2 || "",
      city: address.city || "",
      province: address.province || "",
      postalCode: address.postalCode || "",
      country: "IT",
      phone: address.phone || "",
    })
  }

  const checkout = await stripe.checkout.sessions.create({
    customer_email: customerEmail,
    line_items: lineItems,
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_URL}/ordine-confermato?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/cart?cancelled=true`,
    metadata,
  })

  return NextResponse.json({ url: checkout.url })
}
