import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")

  if (!q || q.length < 1) {
    return NextResponse.json({ products: [], categories: [] })
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        published: true,
        name: { contains: q, mode: "insensitive" },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: true,
        category: { select: { name: true } },
      },
      take: 5,
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      where: {
        name: { contains: q, mode: "insensitive" },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
      },
      take: 5,
      orderBy: { name: "asc" },
    }),
  ])

  return NextResponse.json({ products, categories })
}
