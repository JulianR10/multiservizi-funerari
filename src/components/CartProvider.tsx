"use client"

import { useEffect } from "react"
import { useCart } from "@/hooks/useCart"

export function CartProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const sync = () => {
      const { items, syncProductData } = useCart.getState()
      const ids = items.map((i) => i.productId)
      if (ids.length > 0) {
        fetch(`/api/cart?ids=${ids.join(",")}`)
          .then((res) => res.json())
          .then((products) => syncProductData(products))
      }
    }

    const unsub = useCart.persist.onFinishHydration(sync)

    if (useCart.persist.hasHydrated()) sync()

    return unsub
  }, [])

  return <>{children}</>
}
