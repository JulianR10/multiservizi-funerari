"use client"

import { useState, useEffect } from "react"
import { formatPrice } from "@/lib/format"
import { qualifiesForFreeShipping } from "@/lib/shipping"

type ShippingMethod = {
  id: string
  name: string
  price: number
}

export function ShippingEstimate({ subtotal }: { subtotal: number }) {
  const [cheapest, setCheapest] = useState<ShippingMethod | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/shipping-methods")
      .then((res) => res.json())
      .then((methods: ShippingMethod[]) => {
        if (methods.length > 0) setCheapest(methods[0])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null

  if (qualifiesForFreeShipping(subtotal)) {
    return (
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>Spedizione</span>
        <span className="font-medium text-green-700">Gratuita</span>
      </div>
    )
  }

  if (!cheapest) return null

  return (
    <div className="flex items-center justify-between text-xs text-zinc-500">
      <span>Spedizione (da {cheapest.name})</span>
      <span>{formatPrice(cheapest.price)}</span>
    </div>
  )
}
