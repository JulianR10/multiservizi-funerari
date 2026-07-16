"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/hooks/useCart"
import { toast } from "sonner"

type ProductLite = {
  productId: string
  name: string
  price: number
  image: string
  slug: string
  stock: number
}

export function ReorderProductButton({ product }: { product: ProductLite }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [, startTransition] = useTransition()

  function handleClick() {
    setLoading(true)
    startTransition(() => {
      useCart.getState().addItem(
        {
          productId: product.productId,
          name: product.name,
          price: product.price,
          image: product.image,
          slug: product.slug,
          stock: product.stock,
        },
        1
      )
      toast.success("Aggiunto al carrello")
      router.refresh()
      setLoading(false)
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label={`Aggiungi ${product.name} al carrello`}
      className="rounded-md bg-primary p-2 text-white transition hover:bg-primary-hover disabled:opacity-50"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
      </svg>
    </button>
  )
}
