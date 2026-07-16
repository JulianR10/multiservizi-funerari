"use client"

import { useState } from "react"
import { useCart } from "@/hooks/useCart"
import { toast } from "sonner"

type AddToCartButtonProps = {
  productId: string
  product?: {
    name: string
    price: number
    images: string[]
    slug: string
    stock: number
  }
}

export function AddToCartButton({ productId, product: productData }: AddToCartButtonProps) {
  const addItem = useCart((s) => s.addItem)
  const setSlideOver = useCart((s) => s.setSlideOver)
  const currentQty = useCart((s) => s.items.find((i) => i.productId === productId)?.quantity ?? 0)
  const [feedback, setFeedback] = useState<"idle" | "loading" | "success">("idle")
  const [quantity, setQuantity] = useState(1)

  const stock = productData?.stock ?? 0
  const isOutOfStock = stock <= 0
  const maxAdd = stock - currentQty

  function resolveProduct() {
    const name = productData?.name
    const price = productData?.price
    const image = productData?.images?.[0] || ""
    const slug = productData?.slug || ""
    const available = stock
    return { name, price, image, slug, available }
  }

  async function handleAdd() {
    if (feedback === "loading" || maxAdd <= 0 || quantity <= 0) return
    setFeedback("loading")

    try {
      const { name, price, image, slug, available } = resolveProduct()

      let finalName = name
      let finalPrice = price
      let finalImage = image
      let finalSlug = slug
      let finalAvailable = available

      if (!productData && !isOutOfStock) {
        const res = await fetch(`/api/products?id=${productId}`)
        const data = await res.json()
        if (data) {
          finalName = data.name
          finalPrice = data.price
          finalImage = data.images?.[0] || ""
          finalSlug = data.slug || ""
          finalAvailable = data.stock ?? 0
        }
      }

      const qtyToAdd = Math.min(quantity, finalAvailable - currentQty)

      if (qtyToAdd > 0 && finalName && finalPrice !== undefined) {
        addItem({ productId, name: finalName, price: finalPrice, image: finalImage, slug: finalSlug, stock: finalAvailable }, qtyToAdd)
        setFeedback("success")
        setQuantity(1)
        setTimeout(() => setFeedback("idle"), 1500)

        toast(`Aggiunto${qtyToAdd > 1 ? " x" + qtyToAdd : ""} al carrello`, {
          description: finalName,
          action: {
            label: "Vedi carrello",
            onClick: () => setSlideOver(true),
          },
          duration: 3000,
        })
      } else {
        setFeedback("idle")
      }
    } catch {
      setFeedback("idle")
      toast("Errore", {
        description: "Impossibile aggiungere il prodotto al carrello. Riprova.",
        duration: 3000,
      })
    }
  }

  if (isOutOfStock) {
    return (
      <button
        disabled
        className="flex cursor-not-allowed items-center gap-2 rounded-full bg-zinc-300 px-8 py-3 text-sm font-medium text-zinc-500"
      >
        Esaurito
      </button>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded-full border border-zinc-300">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={quantity <= 1}
          className="flex h-10 w-10 items-center justify-center rounded-l-full text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          aria-label="Diminuisci quantità"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden={true}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
          </svg>
        </button>
        <span className="flex h-10 min-w-[2.5rem] items-center justify-center text-sm font-medium text-zinc-900 select-none" aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.min(maxAdd, q + 1))}
          disabled={quantity >= maxAdd}
          className="flex h-10 w-10 items-center justify-center rounded-r-full text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          aria-label="Aumenta quantità"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden={true}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
          </svg>
        </button>
      </div>

      <button
        onClick={handleAdd}
        disabled={feedback === "loading" || maxAdd <= 0}
        className={`flex items-center gap-2 rounded-full px-8 py-3 text-sm font-medium text-white transition-all duration-200 cursor-pointer ${
          feedback === "success"
            ? "bg-emerald-600 scale-105"
            : "bg-zinc-900 hover:bg-zinc-800 active:scale-95"
        }`}
      >
        {feedback === "loading" ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Aggiungendo...
          </>
        ) : feedback === "success" ? (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            Aggiunto!
          </>
        ) : maxAdd <= 0 ? (
          "Limite raggiunto"
        ) : (
          "Aggiungi al carrello"
        )}
      </button>
    </div>
  )
}
