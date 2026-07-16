"use client"

import { useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { useCart } from "@/hooks/useCart"

export function ClearCartOnSuccess() {
  const searchParams = useSearchParams()
  const clearCart = useCart((s) => s.clearCart)
  const done = useRef(false)

  useEffect(() => {
    if (searchParams.has("session_id") && !done.current) {
      done.current = true
      clearCart()
    }
  }, [searchParams, clearCart])

  return null
}
