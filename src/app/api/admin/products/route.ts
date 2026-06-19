import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdminApi } from "@/lib/admin-guard"

export async function GET() {
  const unauthorized = await assertAdminApi()
  if (unauthorized) return unauthorized

  const products: any[] = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(products)
}
