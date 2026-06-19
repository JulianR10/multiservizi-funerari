import Link from "next/link"
import Image from "next/image"
import { formatPrice } from "@/lib/format"

type ProductCardProps = {
  product: {
    id: string
    name: string
    slug: string
    price: number
    comparePrice: number | null
    images: string[]
    category: { name: string }
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images[0] || "/placeholder.svg"

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group rounded-lg border border-zinc-200 bg-chalk p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden rounded-md bg-zinc-100">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover transition group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
        />
      </div>
      <div className="mt-4">
        <p className="text-xs text-zinc-500">{product.category.name}</p>
        <h3 className="mt-1 text-sm font-medium text-zinc-900">{product.name}</h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold text-zinc-900">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && (  
            <span className="text-sm text-zinc-400 line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
