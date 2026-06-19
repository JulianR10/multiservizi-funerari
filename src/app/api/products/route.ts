import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 })
  }

  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      price: true,
      images: true,
      slug: true,
      stock: true,
    },
  })

  if (!product) {
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }

  return NextResponse.json(product)
}
