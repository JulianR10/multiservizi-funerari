"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useCart } from "@/hooks/useCart"

export function ClearCartOnSuccess() {
  const searchParams = useSearchParams()
  const clearCart = useCart((s) => s.clearCart)

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      clearCart()
    }
  }, [searchParams, clearCart])

  return null
}
