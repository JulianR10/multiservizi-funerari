"use client"

import { useEffect, useRef } from "react"
import { useCart } from "@/hooks/useCart"
import { toast } from "sonner"

const REORDER_COOKIE = "reorder_items"

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.split("=")[1]) : null
}

function clearCookie(name: string) {
  if (typeof document === "undefined") return
  document.cookie = `${name}=; Max-Age=0; path=/`
}

type ReorderPayload = {
  productId: string
  name: string
  price: number
  image: string
  slug: string
  stock: number
  quantity: number
}[]

export function ReorderConsumer() {
  const consumed = useRef(false)

  useEffect(() => {
    if (consumed.current) return
    const raw = readCookie(REORDER_COOKIE)
    if (!raw) return
    consumed.current = true

    try {
      const items = JSON.parse(raw) as ReorderPayload
      if (!Array.isArray(items) || items.length === 0) {
        clearCookie(REORDER_COOKIE)
        return
      }

      const cart = useCart.getState()
      cart.clearCart()
      for (const item of items) {
        cart.addItem(
          {
            productId: item.productId,
            name: item.name,
            price: item.price,
            image: item.image,
            slug: item.slug,
            stock: item.stock,
          },
          item.quantity
        )
      }
      clearCookie(REORDER_COOKIE)
      toast.success(`${items.length} articol${items.length === 1 ? "o" : "i"} nel carrello`)
    } catch (err) {
      console.error("Reorder cookie parse error", err)
      clearCookie(REORDER_COOKIE)
    }
  }, [])

  return null
}
