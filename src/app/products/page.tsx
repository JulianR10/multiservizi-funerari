import { prisma } from "@/lib/prisma"
import { ProductCard } from "@/components/ProductCard"
import { SearchBar } from "@/components/SearchBar"
import { CategorySidebar } from "@/components/CategorySidebar"
import { cacheLife } from "next/cache"

type Props = {
  searchParams: Promise<{ category?: string; q?: string }>
}

export default async function ProductsPage({ searchParams }: Props) {
  const { category, q } = await searchParams
  return <ProductsContent category={category} q={q} />
}

async function ProductsContent({ category, q }: { category?: string; q?: string }) {
  'use cache'
  cacheLife('minutes')

  const where = {
    published: true,
    ...(category && { category: { slug: category } }),
    ...(q && { name: { contains: q, mode: "insensitive" as const } }),
  }

  const products: any[] = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "desc" },
  })

  const allCategories: any[] = await prisma.category.findMany({
    where: { parentId: null },
    include: { children: { orderBy: { name: "asc" } } },
    orderBy: { name: "asc" },
  })

  const flattened = allCategories.flatMap((cat: any) => [cat, ...cat.children])

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-900">Prodotti</h1>
        <p className="text-sm text-zinc-400">{products.length} prodotti</p>
      </div>

      <div className="mt-8 max-w-md">
        <SearchBar q={q} large />
      </div>

      {/* Mobile: pill filters */}
      <div className="mt-6 lg:hidden">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <a
            href="/products"
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition ${
              !category
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            Tutti
          </a>
          {flattened.map(
            (cat: { id: string; slug: string; name: string }) => (
              <a
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition ${
                  category === cat.slug
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {cat.name}
              </a>
            )
          )}
        </div>
      </div>

      {/* Desktop: sidebar + products */}
      <div className="mt-8 lg:grid lg:grid-cols-[280px_1fr] lg:gap-10">
        <aside className="hidden lg:block">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Categorie
          </h2>
          <CategorySidebar categories={allCategories} activeCategory={category} />
        </aside>

        <div>
          {products.length === 0 ? (
            <p className="mt-12 text-center text-zinc-500">
              Nessun prodotto trovato.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
