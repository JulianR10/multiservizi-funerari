import Image from "next/image"
import dynamic from "next/dynamic"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/format"
import { cacheLife } from "next/cache"

const AddToCartButton = dynamic(
  () => import("@/components/AddToCartButton").then((m) => m.AddToCartButton)
)

type Props = {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"><div className="h-96 animate-pulse rounded-lg bg-zinc-200" /></div>}>
      <ProductContent slug={slug} />
    </Suspense>
  )
}

async function ProductContent({ slug }: { slug: string }) {
  'use cache'
  cacheLife('minutes')

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  })

  if (!product || !product.published) notFound()

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-400">
              Nessuna immagine
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-zinc-500">{product.category.name}</p>
          <h1 className="mt-2 text-3xl font-bold text-zinc-900">{product.name}</h1>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-3xl font-bold text-zinc-900">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && (
              <span className="text-lg text-zinc-400 line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>

          <p className="mt-6 text-base leading-7 text-zinc-600">
            {product.description || "Nessuna descrizione disponibile."}
          </p>

          <div className="mt-8">
            <AddToCartButton productId={product.id} />
          </div>

          {product.stock <= 0 && (
            <p className="mt-3 text-sm text-red-600">Prodotto esaurito</p>
          )}
        </div>
      </div>
    </div>
  )
}
