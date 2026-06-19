import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

export async function GET(req: Request) {
  const ip = getClientIp(req)
  const rateCheck = checkRateLimit(`orders-by-email:${ip}`, 10, 60_000)
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: "Troppe richieste. Riprova tra qualche minuto." }, { status: 429 })
  }

  const { searchParams } = new URL(req.url)
  const email = searchParams.get("email")?.trim().toLowerCase()
  const orderNumber = searchParams.get("orderNumber")?.trim()

  if (!email) {
    return NextResponse.json({ error: "Email richiesta" }, { status: 400 })
  }

  if (orderNumber) {
    const order: any = await prisma.order.findFirst({
      where: { guestEmail: email, invoiceNumber: orderNumber },
      include: { items: true },
    })

    return NextResponse.json(order ? [order] : [])
  }

  const orders: any[] = await prisma.order.findMany({
    where: { guestEmail: email },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(orders)
}
