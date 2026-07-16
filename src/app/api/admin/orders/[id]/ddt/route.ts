import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdminApi } from "@/lib/admin-guard"
import { generateDdtPdf } from "@/lib/ddt-pdf"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await assertAdminApi()
  if (authError) return authError

  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      shippingAddress: true,
    },
  })

  if (!order) {
    return NextResponse.json({ error: "Ordine non trovato" }, { status: 404 })
  }

  if (order.status !== "shipped" && order.status !== "delivered" && order.status !== "confirmed") {
    return NextResponse.json(
      { error: "DDT generabile solo per ordini confermati/spediti/consegnati" },
      { status: 400 }
    )
  }

  const customerName = order.shippingAddress
    ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
    : order.guestEmail || "Cliente"

  const ddtNumber = `DDT-${order.invoiceNumber || order.id.slice(0, 8).toUpperCase()}`

  const pdfBuffer = generateDdtPdf({
    ddtNumber,
    date: order.createdAt,
    orderNumber: order.invoiceNumber || order.id.slice(0, 8),
    invoiceNumber: order.invoiceNumber,
    customerName,
    customerAddress: order.shippingAddress?.address || undefined,
    customerCity: order.shippingAddress?.city || undefined,
    customerPostalCode: order.shippingAddress?.postalCode || undefined,
    customerProvince: order.shippingAddress?.province || undefined,
    customerCompany: order.shippingAddress?.company || undefined,
    items: order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
    })),
    totalPackages: 1,
    cause: "VENDITA",
  })

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${ddtNumber}.pdf"`,
    },
  })
}
