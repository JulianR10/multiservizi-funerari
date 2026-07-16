import type { Metadata } from "next"
import dynamic from "next/dynamic"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/format"
import { ImageGallery } from "@/components/ImageGallery"
import { ProductCard } from "@/components/ProductCard"
import { Breadcrumbs } from "@/components/Breadcrumbs"
import { StickyAddToCart } from "@/components/StickyAddToCart"
import { getCustomerSession } from "@/lib/customer-auth"

const AddToCartButton = dynamic(
  () => import("@/components/AddToCartButton").then((m) => m.AddToCartButton)
)

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, description: true, images: true, price: true },
  })
  if (!product) return {}

  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000"
  const imageUrl = product.images[0]
    ? product.images[0].startsWith("http") ? product.images[0] : `${baseUrl}${product.images[0]}`
    : `${baseUrl}/placeholder.svg`

  return {
    title: `${product.name} | Petrungaro Multiservizi`,
    description: product.description || `${product.name} — acquista online su Petrungaro Multiservizi.`,
    openGraph: {
      title: product.name,
      description: product.description || undefined,
      images: [{ url: imageUrl }],
      type: "website",
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-4 w-48 animate-pulse rounded bg-zinc-200" />
        <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-lg bg-zinc-200" />
          <div className="space-y-4">
            <div className="h-4 w-1/3 animate-pulse rounded bg-zinc-200" />
            <div className="h-8 w-3/4 animate-pulse rounded bg-zinc-200" />
            <div className="mt-4 h-6 w-1/4 animate-pulse rounded bg-zinc-200" />
            <div className="mt-6 space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-zinc-200" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-200" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-200" />
            </div>
            <div className="mt-8 h-12 w-48 animate-pulse rounded-full bg-zinc-200" />
          </div>
        </div>
      </div>
    }>
      <ProductContent slug={slug} />
    </Suspense>
  )
}

async function ProductContent({ slug }: { slug: string }) {
  const [product, session] = await Promise.all([
    prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    }),
    getCustomerSession(),
  ])

  if (!product || !product.published) notFound()

  const showPrice = session?.role === "user" && session?.status === "APPROVED"

  const relatedProducts = await prisma.product.findMany({
    where: {
      published: true,
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
    include: { category: true },
  })

  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000"

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || "",
    image: product.images.map((img) => (img.startsWith("http") ? img : `${baseUrl}${img}`)),
    sku: product.slug,
    category: product.category.name,
    offers: {
      "@type": "Offer",
      price: (product.price / 100).toFixed(2),
      priceCurrency: "EUR",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${baseUrl}/prodotti/${product.slug}`,
    },
  }

  return (
    <>
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs segments={[
        { label: "Prodotti", href: "/prodotti" },
        { label: product.name },
      ]} />
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <ImageGallery images={product.images} productName={product.name} />

        <div>
          <p className="text-sm text-zinc-500">{product.category.name}</p>
          <h1 className="mt-2 text-3xl font-bold text-zinc-900">{product.name}</h1>

          {showPrice && (
            <p className="mt-4 text-sm">
              {product.stock > 0 ? (
                <span className="text-emerald-600">
                  {product.stock <= 3 ? `Solo ${product.stock} pezzi rimasti` : "Disponibile"}
                </span>
              ) : (
                <span className="text-red-500">Esaurito</span>
              )}
            </p>
          )}

          {showPrice ? (
            <>
              <div className="mt-4 flex items-center gap-3">
                <span className="text-3xl font-bold text-zinc-900">
                  {formatPrice(product.price)}
                </span>
                {product.comparePrice && (
                  <>
                    <span className="text-lg text-zinc-400 line-through">
                      {formatPrice(product.comparePrice)}
                    </span>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      Prezzo dedicato
                    </span>
                  </>
                )}
              </div>

              <p className="mt-6 text-base leading-7 text-zinc-600">
                {product.description || "Nessuna descrizione disponibile."}
              </p>

              <div className="mt-8">
                <AddToCartButton
                  productId={product.id}
                  product={{ name: product.name, price: product.price, images: product.images, slug: product.slug, stock: product.stock }}
                />
              </div>
            </>
          ) : session?.status === "PENDING" ? (
            <>
              <p className="mt-6 text-base leading-7 text-zinc-600">
                {product.description || "Nessuna descrizione disponibile."}
              </p>
              <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
                <p className="text-sm font-medium text-amber-800">
                  Il tuo account è in attesa di approvazione. Riceverai una email non appena sarà attivato.
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="mt-6 text-base leading-7 text-zinc-600">
                {product.description || "Nessuna descrizione disponibile."}
              </p>
              <div className="mt-8 rounded-lg border border-primary/20 bg-primary/5 p-6 text-center">
                <p className="text-sm font-medium text-primary">
                  Registrati per vedere i prezzi e acquistare.
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <Link
                    href="/auth/register"
                    className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
                  >
                    Registrati
                  </Link>
                  <Link
                    href="/auth/login"
                    className="rounded-full border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                  >
                    Accedi
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-zinc-900">Potrebbe interessarti anche</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((rp) => (
              <ProductCard key={rp.id} product={rp} showPrice={showPrice} sessionStatus={session?.status} />
            ))}
          </div>
        </section>
      )}
    </div>

    {showPrice && product.stock > 0 && (
      <StickyAddToCart
        productId={product.id}
        product={{ name: product.name, price: product.price, images: product.images, slug: product.slug, stock: product.stock }}
      />
    )}
    </>
  )
}
