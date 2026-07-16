import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"
import { getCustomerSession } from "@/lib/customer-auth"

export async function GET(req: Request) {
  const ip = getClientIp(req)
  const rateCheck = checkRateLimit(`orders-by-email:${ip}`, 10, 60_000)
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: "Troppe richieste. Riprova tra qualche minuto." }, { status: 429 })
  }

  const { searchParams } = new URL(req.url)
  const email = searchParams.get("email")?.trim().toLowerCase()
  const orderNumber = searchParams.get("orderNumber")?.trim()

  const session = await getCustomerSession()
  const sessionEmail = session?.email?.toLowerCase() || null

  if (session) {
    if (orderNumber) {
      const order = await prisma.order.findFirst({
        where: {
          OR: [
            { userId: session.userId },
            { guestEmail: sessionEmail },
          ],
          invoiceNumber: orderNumber,
        },
        include: { items: true },
      })
      return NextResponse.json(order ? [order] : [])
    }

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { userId: session.userId },
          { guestEmail: sessionEmail },
        ],
      },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(orders)
  }

  if (!email) {
    return NextResponse.json({ error: "Email richiesta" }, { status: 400 })
  }

  if (!orderNumber) {
    return NextResponse.json(
      { error: "Per consultare gli ordini senza accesso è necessario il numero fattura." },
      { status: 400 }
    )
  }

  const order = await prisma.order.findFirst({
    where: { guestEmail: email, invoiceNumber: orderNumber },
    include: { items: true },
  })

  return NextResponse.json(order ? [order] : [])
}
