import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCustomerSession } from "@/lib/customer-auth"
import { generateInvoicePdf } from "@/lib/invoice-pdf"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCustomerSession()
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  }

  const { id } = await params

  const order = await prisma.order.findFirst({
    where: {
      id,
      OR: [{ userId: session.userId }, { guestEmail: session.email }],
    },
    include: {
      items: true,
      shippingAddress: true,
    },
  })

  if (!order) {
    return NextResponse.json({ error: "Ordine non trovato" }, { status: 404 })
  }

  if (!order.invoiceNumber) {
    return NextResponse.json({ error: "Fattura non disponibile" }, { status: 400 })
  }

  const customerName = order.shippingAddress
    ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
    : order.guestEmail || "Cliente"

  const pdfBuffer = generateInvoicePdf({
    invoiceNumber: order.invoiceNumber,
    date: order.createdAt,
    customerName,
    customerAddress: order.shippingAddress?.address || undefined,
    customerCity: order.shippingAddress?.city || undefined,
    customerPostalCode: order.shippingAddress?.postalCode || undefined,
    customerProvince: order.shippingAddress?.province || undefined,
    customerCompany: order.shippingAddress?.company || undefined,
    items: order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
    subtotal: order.subtotal,
    tax: order.tax,
    total: order.total,
  })

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${order.invoiceNumber}.pdf"`,
    },
  })
}
