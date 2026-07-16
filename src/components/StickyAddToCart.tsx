"use client"

import { useState } from "react"
import { useCart } from "@/hooks/useCart"
import { toast } from "sonner"

type Props = {
  productId: string
  product: {
    name: string
    price: number
    images: string[]
    slug: string
    stock: number
  }
}

export function StickyAddToCart({ productId, product }: Props) {
  const addItem = useCart((s) => s.addItem)
  const setSlideOver = useCart((s) => s.setSlideOver)
  const [feedback, setFeedback] = useState<"idle" | "loading" | "success">("idle")
  const currentQty = useCart((s) => s.items.find((i) => i.productId === productId)?.quantity ?? 0)
  const canAdd = currentQty < product.stock

  async function handleAdd() {
    if (feedback === "loading" || !canAdd) return
    setFeedback("loading")
    const image = product.images[0] || ""

    addItem({ productId, name: product.name, price: product.price, image, slug: product.slug, stock: product.stock })
    setFeedback("success")
    setTimeout(() => setFeedback("idle"), 1500)
    toast("Aggiunto al carrello", {
      description: product.name,
      action: { label: "Vedi carrello", onClick: () => setSlideOver(true) },
      duration: 3000,
    })
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-chalk/95 backdrop-blur-md px-4 py-3 lg:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-zinc-900">{product.name}</p>
          <p className="text-lg font-bold text-primary">&euro;{(product.price / 100).toFixed(2)}</p>
        </div>
        <button
          onClick={handleAdd}
          disabled={feedback === "loading" || !canAdd}
          className={`shrink-0 rounded-full px-6 py-2.5 text-sm font-medium text-white transition-all duration-200 cursor-pointer ${
            feedback === "success"
              ? "bg-emerald-600 scale-105"
              : !canAdd
                ? "bg-zinc-300 text-zinc-500 cursor-not-allowed"
                : "bg-zinc-900 hover:bg-zinc-800 active:scale-95"
          }`}
        >
          {feedback === "loading" ? (
            "Aggiungendo..."
          ) : feedback === "success" ? (
            "Aggiunto!"
          ) : !canAdd ? (
            "Limite raggiunto"
          ) : (
            "Aggiungi"
          )}
        </button>
      </div>
    </div>
  )
}

