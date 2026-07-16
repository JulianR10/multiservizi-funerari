import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdminApi } from "@/lib/admin-guard"

export async function GET() {
  const unauthorized = await assertAdminApi()
  if (unauthorized) return unauthorized

  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [
    totalOrders,
    totalRevenue,
    totalProducts,
    revenueLast30Days,
    ordersLast30Days,
    recentOrders,
    orderItems,
    dailyOrders,
    statusCounts,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "paid" } }),
    prisma.product.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: "paid", createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        items: { select: { name: true, quantity: true } },
      },
    }),
    prisma.orderItem.findMany({
      include: { product: { select: { name: true } } },
      where: { order: { paymentStatus: "paid" } },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, total: true, paymentStatus: true },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: true,
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
  ])

  const productMap = new Map<string, { name: string; totalSold: number; revenue: number }>()
  for (const item of orderItems) {
    const existing = productMap.get(item.productId)
    const name = item.product?.name || item.name
    if (existing) {
      existing.totalSold += item.quantity
      existing.revenue += item.price * item.quantity
    } else {
      productMap.set(item.productId, {
        name,
        totalSold: item.quantity,
        revenue: item.price * item.quantity,
      })
    }
  }

  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  const dailyRevenue: { date: string; revenue: number; orders: number }[] = []
  const revenueMap = new Map<string, { revenue: number; orders: number }>()
  for (const order of dailyOrders) {
    const dateStr = order.createdAt.toISOString().split("T")[0]
    const existing = revenueMap.get(dateStr) || { revenue: 0, orders: 0 }
    if (order.paymentStatus === "paid") {
      existing.revenue += order.total
    }
    existing.orders += 1
    revenueMap.set(dateStr, existing)
  }
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split("T")[0]
    const data = revenueMap.get(dateStr) || { revenue: 0, orders: 0 }
    dailyRevenue.push({
      date: dateStr,
      revenue: data.revenue,
      orders: data.orders,
    })
  }

  const orderStatusBreakdown = statusCounts.map((s) => ({
    status: s.status,
    count: s._count,
  }))

  return NextResponse.json({
    totalOrders,
    totalRevenue: totalRevenue._sum.total || 0,
    totalProducts,
    revenueLast30Days: revenueLast30Days._sum.total || 0,
    ordersLast30Days,
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      invoiceNumber: o.invoiceNumber,
      guestEmail: o.guestEmail,
      user: o.user,
      total: o.total,
      status: o.status,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt.toISOString(),
      items: o.items,
    })),
    topProducts,
    dailyRevenue,
    orderStatusBreakdown,
  })
}
