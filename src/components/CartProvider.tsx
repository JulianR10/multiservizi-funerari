"use client"

import { useEffect } from "react"
import { useCart } from "@/hooks/useCart"

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { items, syncProductData } = useCart()

  useEffect(() => {
    const ids = items.map((i) => i.productId)
    if (ids.length > 0) {
      fetch(`/api/cart?ids=${ids.join(",")}`)
        .then((res) => res.json())
        .then((products) => {
          syncProductData(products)
        })
    }
  }, [])

  return <>{children}</>
}
