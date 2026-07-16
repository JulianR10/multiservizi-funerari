import Link from "next/link"
import Image from "next/image"
import type { CategoryWithPreview } from "@/lib/categories"

const categoryBgMap: Record<string, string> = {
  "linea-marmi": "/images/categories/linea-marmi.webp",
  "accessori-cimiteriali": "/images/categories/acc-cemetiriali.webp",
  "articoli-funebri": "/images/categories/art-funebri.webp",
  "fotoceramiche": "/images/categories/fotoceramiche.webp",
}

export function CategoryGrid({
  categories,
  activeCategory,
  totalProducts,
}: {
  categories: CategoryWithPreview[]
  activeCategory?: string
  totalProducts: number
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {categories.map((cat) => {
          const bgSrc = categoryBgMap[cat.slug] || cat.previewImage

          return (
            <Link
              key={cat.id}
              href={`/prodotti?category=${cat.slug}`}
              className={`group relative flex h-44 flex-col justify-end overflow-hidden rounded-xl border-2 transition ${
                activeCategory === cat.slug
                  ? "border-primary"
                  : "border-zinc-200 hover:border-zinc-300"
              }`}
            >
              {bgSrc ? (
                <Image
                  src={bgSrc}
                  alt=""
                  fill
                  className="object-cover blur-[2px] transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-zinc-200" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="relative z-10 p-5">
                <span className="font-heading text-lg font-semibold text-white">{cat.name}</span>
                <p className="mt-0.5 text-sm text-white/70">
                  {cat._count.products} articoli
                </p>
              </div>
            </Link>
          )
        })}
      </div>

      <Link
        href="/prodotti"
        className={`mx-auto flex w-max items-center gap-2 rounded-xl border-2 px-5 py-3 text-center text-sm font-medium transition ${
          !activeCategory
            ? "border-primary bg-primary/5 text-primary"
            : "border-zinc-200 bg-chalk text-zinc-600 hover:border-zinc-300 hover:bg-chalk-dark"
        }`}
      >
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
        Tutti i prodotti
        <span className="text-xs text-zinc-400">({totalProducts} articoli)</span>
      </Link>
    </div>
  )
}
