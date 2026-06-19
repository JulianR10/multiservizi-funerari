import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdminApi } from "@/lib/admin-guard"

export async function GET() {
  const unauthorized = await assertAdminApi()
  if (unauthorized) return unauthorized

  const orders: any[] = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(orders)
}
