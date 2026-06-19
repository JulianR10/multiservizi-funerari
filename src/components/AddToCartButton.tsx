"use client"

import { useState } from "react"
import { useCart } from "@/hooks/useCart"

export function AddToCartButton({ productId }: { productId: string }) {
  const { addItem } = useCart()
  const [feedback, setFeedback] = useState<"idle" | "loading" | "success">("idle")

  async function handleAdd() {
    if (feedback === "loading") return

    setFeedback("loading")

    try {
      const res = await fetch(`/api/products?id=${productId}`)
      const product = await res.json()

      if (product) {
        addItem({
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || "",
          slug: product.slug,
        })
        setFeedback("success")
        setTimeout(() => setFeedback("idle"), 1500)
      }
    } catch {
      setFeedback("idle")
    }
  }

  return (
    <button
      onClick={handleAdd}
      disabled={feedback === "loading"}
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
      ) : (
        "Aggiungi al carrello"
      )}
    </button>
  )
}
