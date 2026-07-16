import { Suspense } from "react"
import { assertAdminPage } from "@/lib/admin-guard"
import { prisma } from "@/lib/prisma"
import { AdminProductsClient } from "./client"

const PER_PAGE = 15

type Props = {
  searchParams: Promise<{ page?: string; q?: string }>
}

export default async function AdminProductsPage({ searchParams }: Props) {
  await assertAdminPage()
  const { page: pageStr, q } = await searchParams
  const currentPage = Math.max(1, Number(pageStr) || 1)

  const isLowStockFilter = q === "lowstock"

  const where = !q || isLowStockFilter
    ? {}
    : { name: { contains: q.trim(), mode: "insensitive" as const } }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.product.count({ where }),
  ])

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Suspense fallback={null}>
        <AdminProductsClient
          initialProducts={products.map((p) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            stock: p.stock,
            published: p.published,
          }))}
          total={total}
          currentPage={currentPage}
          totalPages={totalPages}
          q={isLowStockFilter ? "" : q || ""}
        />
      </Suspense>
    </div>
  )
}
