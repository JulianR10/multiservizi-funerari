import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { sendOrderConfirmation } from "@/lib/email"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")!

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event)
      break
    case "charge.refunded":
      await handleChargeRefunded(event)
      break
    case "payment_intent.payment_failed":
      await handlePaymentFailed(event)
      break
    case "checkout.session.expired":
      await handleSessionExpired(event)
      break
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutCompleted(event: any) {
  const session = event.data.object
  const rawMeta = session.metadata || {}

  const guestEmail = rawMeta.guestEmail
  const stripePaymentId = session.id
  const stripePaymentIntentId = session.payment_intent || null

  const existing = await prisma.order.findFirst({
    where: { stripePaymentId },
  })
  if (existing) return

  const items: { productId: string; quantity: number }[] = JSON.parse(rawMeta.items)
  const productIds = items.map((i: any) => i.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  })
  const productMap = new Map(products.map((p) => [p.id, p]))

  for (const item of items) {
    const product = productMap.get(item.productId)
    if (!product) {
      console.error(`[WEBHOOK] Prodotto ${item.productId} non trovato`)
      return
    }
    if (product.stock < item.quantity) {
      console.error(`[WEBHOOK] Stock insufficiente per ${product.name}: disponibili ${product.stock}, richiesti ${item.quantity}`)
      return
    }
  }

  const subtotal = items.reduce((acc: number, item: any) => {
    const product = productMap.get(item.productId)!
    return acc + product.price * item.quantity
  }, 0)
  const tax = Math.round(subtotal * 0.22)
  const total = session.amount_total ?? (subtotal + tax)

  const now = new Date()
  const invoiceNumber = `FATT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

  const order = await prisma.order.create({
    data: {
      guestEmail,
      subtotal,
      tax,
      total,
      invoiceNumber,
      status: "confirmed",
      paymentStatus: "paid",
      paymentMethod: "stripe",
      stripePaymentId,
      stripePaymentIntentId,
      items: {
        create: items.map((item: any) => {
          const product = productMap.get(item.productId)!
          return {
            productId: item.productId,
            quantity: item.quantity,
            price: product.price,
            name: product.name,
          }
        }),
      },
    } as any,
  })

  for (const item of items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    })
  }

  if (rawMeta.shippingAddress) {
    const addr = JSON.parse(rawMeta.shippingAddress)

    const addressRecord = await prisma.address.create({
      data: {
        firstName: addr.firstName || "",
        lastName: addr.lastName || "",
        company: addr.company || "",
        address: addr.address || "",
        address2: addr.address2 || "",
        city: addr.city || "",
        province: addr.province || "",
        postalCode: addr.postalCode || "",
        country: addr.country || "IT",
        phone: addr.phone || "",
      },
    })

    await prisma.order.update({
      where: { id: order.id },
      data: { shippingAddressId: addressRecord.id },
    })
  }

  if (guestEmail) {
    const orderItems = items.map((item: any) => {
      const product = productMap.get(item.productId)!
      return {
        name: product.name,
        quantity: item.quantity,
        price: product.price,
      }
    })

    await sendOrderConfirmation({
      id: order.id,
      invoiceNumber: order.invoiceNumber,
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      createdAt: order.createdAt,
      items: orderItems,
      customerEmail: guestEmail,
    }).catch((err) => console.error("[WEBHOOK] Errore sending email:", err))
  }
}

async function handleChargeRefunded(event: any) {
  const charge = event.data.object
  const paymentIntentId = charge.payment_intent

  if (!paymentIntentId) return

  const order = await prisma.order.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
  })

  if (!order) {
    console.error(`[WEBHOOK] Ordine non trovato per payment intent ${paymentIntentId}`)
    return
  }

  if (order.paymentStatus === "refunded") return

  const orderItems = await prisma.orderItem.findMany({
    where: { orderId: order.id },
  })

  for (const item of orderItems) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    })
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: "refunded",
      status: "cancelled",
      notes: order.notes
        ? `${order.notes}\nRimborsato il ${new Date().toISOString()}`
        : `Rimborsato il ${new Date().toISOString()}`,
    },
  })

  console.log(`[WEBHOOK] Ordine ${order.invoiceNumber} rimborsato, stock ripristinato`)
}

async function handlePaymentFailed(event: any) {
  const paymentIntent = event.data.object
  console.error(
    `[WEBHOOK] Pagamento fallito per payment intent ${paymentIntent.id}: ${paymentIntent.last_payment_error?.message}`
  )
}

async function handleSessionExpired(event: any) {
  const session = event.data.object
  console.log(`[WEBHOOK] Sessione di pagamento scaduta: ${session.id}`)
}
