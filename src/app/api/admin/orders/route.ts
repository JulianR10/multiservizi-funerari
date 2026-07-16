import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdminApi } from "@/lib/admin-guard"

const PER_PAGE = 20

export async function GET(req: Request) {
  const unauthorized = await assertAdminApi()
  if (unauthorized) return unauthorized

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get("page")) || 1)
  const query = searchParams.get("q")?.trim() || ""

  const where = query
    ? {
        OR: [
          { invoiceNumber: { contains: query, mode: "insensitive" as const } },
          { guestEmail: { contains: query, mode: "insensitive" as const } },
          { stripePaymentId: { contains: query, mode: "insensitive" as const } },
          { user: { name: { contains: query, mode: "insensitive" as const } } },
          { user: { email: { contains: query, mode: "insensitive" as const } } },
          { items: { some: { name: { contains: query, mode: "insensitive" as const } } } },
        ],
      }
    : {}

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.order.count({ where }),
  ])

  return NextResponse.json({ orders, total, page, totalPages: Math.ceil(total / PER_PAGE) })
}
