import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const ids = searchParams.get("ids")?.split(",") || []

  if (ids.length === 0) {
    return NextResponse.json([])
  }

  const products = await prisma.product.findMany({
    where: { id: { in: ids }, published: true },
    select: {
      id: true,
      name: true,
      price: true,
      images: true,
      slug: true,
      stock: true,
    },
  })

  return NextResponse.json(products)
}
