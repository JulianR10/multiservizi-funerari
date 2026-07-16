"use client"

import Link from "next/link"
import Image from "next/image"
import { formatPrice } from "@/lib/format"
import { AddToCartButton } from "@/components/AddToCartButton"

type ProductCardProps = {
  product: {
    id: string
    name: string
    slug: string
    price: number
    comparePrice: number | null
    images: string[]
    stock: number
    category: { name: string }
  }
  showPrice?: boolean
  sessionStatus?: string | null
}

export function ProductCard({ product, showPrice = false, sessionStatus }: ProductCardProps) {
  const imageUrl = product.images[0] || "/placeholder.svg"
  const esaurito = product.stock <= 0

  return (
    <div
      className={`group flex flex-col rounded-lg border bg-chalk-dark p-4 transition-all duration-300 hover:bg-chalk hover:border-primary/30 hover:shadow-md ${
        esaurito ? "border-zinc-200" : "border-zinc-200"
      }`}
    >
      <Link href={`/prodotti/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-md bg-zinc-100">
          {product.comparePrice && showPrice && (
            <div className="absolute left-2 top-2 z-10 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              Prezzo dedicato
            </div>
          )}
          {product.stock > 0 ? (
            <div className="absolute right-2 top-2 z-10 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
              {product.stock <= 3 ? `Solo ${product.stock} rimasti` : "Disponibile"}
            </div>
          ) : (
            <div className="absolute right-2 top-2 z-10 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
              Esaurito
            </div>
          )}
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
          />
        </div>
      </Link>
      <div className="mt-4 flex flex-1 flex-col">
        <Link href={`/prodotti/${product.slug}`}>
          <p className="text-[11px] tracking-wide text-zinc-400">{product.category.name}</p>
          <h3 className="mt-0.5 text-[15px] font-semibold text-zinc-900">{product.name}</h3>
        </Link>
        <div className="mt-2 flex items-center gap-2">
          {showPrice ? (
            <>
              <span className="text-lg font-bold text-zinc-900">
                {formatPrice(product.price)}
              </span>
              {product.comparePrice && (
                <span className="text-sm text-zinc-400 line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </>
          ) : sessionStatus === "PENDING" ? (
            <span className="text-sm font-medium text-amber-600">
              In attesa di approvazione
            </span>
          ) : (
            <Link
              href="/auth/login"
              className="text-sm font-medium text-primary hover:text-primary-hover"
            >
              Accedi per vedere il prezzo
            </Link>
          )}
        </div>
        {showPrice && (
          <div className="mt-auto pt-4" onClick={(e) => e.stopPropagation()}>
            <AddToCartButton
              productId={product.id}
              product={{ name: product.name, price: product.price, images: product.images, slug: product.slug, stock: product.stock }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
