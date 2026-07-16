import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdminApi } from "@/lib/admin-guard"

export async function GET() {
  const authError = await assertAdminApi()
  if (authError) return authError

  const LOW_STOCK_THRESHOLD = 5

  const [pendingUsers, lowStock, openOrders] = await Promise.all([
    prisma.user.count({ where: { role: "user", status: "PENDING" } }),
    prisma.product.count({
      where: {
        published: true,
        stock: { lte: LOW_STOCK_THRESHOLD },
      },
    }),
    prisma.order.count({
      where: {
        status: { in: ["pending", "confirmed"] },
        paymentStatus: "paid",
      },
    }),
  ])

  return NextResponse.json({
    pendingUsers,
    lowStock,
    openOrders,
    lowStockThreshold: LOW_STOCK_THRESHOLD,
  })
}
