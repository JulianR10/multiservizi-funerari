import { Suspense } from "react"
import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { ProductCard } from "@/components/ProductCard"
import { SearchBar } from "@/components/SearchBar"
import { CategoryGrid } from "@/components/CategoryGrid"
import { Pagination } from "@/components/Pagination"
import { Breadcrumbs } from "@/components/Breadcrumbs"
import { getCategoriesWithPreviews } from "@/lib/categories"
import { getCustomerSession } from "@/lib/customer-auth"

const PER_PAGE = 9

type Props = {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { category, q } = await searchParams

  let title = "Catalogo prodotti | Petrungaro Multiservizi"
  let description = "Scopri il nostro catalogo di ceramiche funerarie, lapidi, articoli per il lutto e altri prodotti funebri."

  if (category) {
    const cat = await prisma.category.findUnique({
      where: { slug: category },
      select: { name: true },
    })
    if (cat) {
      const catName = cat.name.charAt(0).toUpperCase() + cat.name.slice(1)
      title = `${catName} | Catalogo | Petrungaro Multiservizi`
      description = `Scopri la nostra selezione di ${cat.name.toLowerCase()}.`
    }
  }

  const metadata: Metadata = {
    title,
    description,
    openGraph: { title, description, type: "website" },
  }

  if (!category && !q) {
    metadata.alternates = { canonical: "/prodotti" }
  }

  return metadata
}

export default async function ProductsPage({ searchParams }: Props) {
  const { category, q, page } = await searchParams
  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <ProductsContent category={category} q={q} page={Number(page) || 1} />
    </Suspense>
  )
}

function ProductsSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="h-4 w-48 animate-pulse rounded bg-zinc-200" />
      <div className="mt-4 flex items-center justify-between">
        <div className="h-8 w-64 animate-pulse rounded bg-zinc-200" />
        <div className="h-4 w-20 animate-pulse rounded bg-zinc-200" />
      </div>
      <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-44 animate-pulse rounded-xl bg-zinc-200" />
        ))}
      </div>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg bg-zinc-100 p-4">
            <div className="aspect-square animate-pulse rounded-md bg-zinc-200" />
            <div className="mt-4 space-y-2">
              <div className="h-3 w-1/3 animate-pulse rounded bg-zinc-200" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200" />
              <div className="h-5 w-1/3 animate-pulse rounded bg-zinc-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

async function ProductsContent({ category, q, page = 1 }: { category?: string; q?: string; page?: number }) {
  const session = await getCustomerSession()
  const showPrice = session?.role === "user" && session?.status === "APPROVED"

  const skip = ((page || 1) - 1) * PER_PAGE

  const where = {
    published: true,
    ...(category && { category: { slug: category } }),
    ...(q && { name: { contains: q, mode: "insensitive" as const } }),
  }

  const [products, total, categoriesWithCounts] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: PER_PAGE,
      include: { category: true },
      orderBy: { name: "asc" },
    }),
    prisma.product.count({ where }),
    getCategoriesWithPreviews(),
  ])

  const totalPages = Math.ceil(total / PER_PAGE)
  const totalAllProducts = await prisma.product.count({ where: { published: true } })

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs segments={[{ label: "Prodotti" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-900">Prodotti</h1>
        <p className="text-sm text-zinc-400">{total} prodotti</p>
      </div>

      <div className="mt-8 max-w-md">
        <SearchBar q={q} large />
      </div>

      <div className="mt-8">
        <CategoryGrid categories={categoriesWithCounts} activeCategory={category} totalProducts={totalAllProducts} />
      </div>

      <div className="mt-10">
        {products.length === 0 ? (
          <div className="mt-12 text-center">
            <svg className="mx-auto h-14 w-14 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} aria-hidden={true}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25-2.25M12 13.875V3" />
            </svg>
            <p className="mt-4 text-zinc-500">Nessun prodotto trovato.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} showPrice={showPrice} sessionStatus={session?.status} />
            ))}
          </div>
        )}

        <Pagination
          currentPage={page || 1}
          totalPages={totalPages}
          searchParams={{ category, q, page: String(page || 1) }}
        />
      </div>
    </div>
  )
}
