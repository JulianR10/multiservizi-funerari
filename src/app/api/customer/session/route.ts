import { NextResponse } from "next/server"
import { getCustomerSession } from "@/lib/customer-auth"
import { prisma } from "@/lib/prisma"
import { checkRateLimitAsync, getClientIp } from "@/lib/rate-limit"

export async function GET(req: Request) {
  const ip = getClientIp(req)
  const { allowed } = await checkRateLimitAsync(`customer-session:${ip}`, 30, 60_000)
  if (!allowed) {
    return NextResponse.json({ error: "Troppe richieste" }, { status: 429 })
  }

  const session = await getCustomerSession()
  if (!session) return NextResponse.json({ session: null })

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      name: true,
      email: true,
      companyName: true,
      phone: true,
      city: true,
      province: true,
      address: true,
      postalCode: true,
      addresses: {
        where: { isDefault: true },
        take: 1,
      },
    },
  })

  if (!user) return NextResponse.json({ session: null })

  const defaultAddr = user.addresses[0]

  const address = {
    firstName: defaultAddr?.firstName || user.name || "",
    lastName: defaultAddr?.lastName || "",
    company: defaultAddr?.company || user.companyName || "",
    address: defaultAddr?.address || user.address || "",
    address2: defaultAddr?.address2 || "",
    city: defaultAddr?.city || user.city || "",
    province: defaultAddr?.province || user.province || "",
    postalCode: defaultAddr?.postalCode || user.postalCode || "",
    phone: defaultAddr?.phone || user.phone || "",
  }

  return NextResponse.json({ session, address })
}
