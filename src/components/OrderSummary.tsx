"use client"

import { formatPrice } from "@/lib/format"
import { computeTax } from "@/lib/tax"

type CartItem = {
  productId: string
  name: string
  price: number
  quantity: number
}

export function OrderSummary({
  items,
  subtotal,
  shippingCost,
}: {
  items: CartItem[]
  subtotal: number
  shippingCost: number
}) {
  const iva = computeTax(subtotal)
  const totale = subtotal + iva + shippingCost

  return (
    <div className="rounded-lg border border-zinc-200 bg-chalk p-4 sm:p-6">
      <h2 className="font-heading text-base font-semibold text-zinc-900">Riepilogo ordine</h2>
      <ul className="mt-3 divide-y divide-zinc-200 text-sm">
        {items.map((item) => (
          <li key={item.productId} className="flex justify-between py-2">
            <span className="text-zinc-700">
              {item.name} <span className="text-zinc-400">x{item.quantity}</span>
            </span>
            <span className="font-medium text-zinc-900">{formatPrice(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 space-y-1 border-t border-zinc-200 pt-3 text-sm">
        <div className="flex justify-between text-zinc-600">
          <span>Subtotale</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-zinc-600">
          <span>IVA 22%</span>
          <span>{formatPrice(iva)}</span>
        </div>
        <div className="flex justify-between text-zinc-600">
          <span>Spedizione</span>
          <span>{shippingCost > 0 ? formatPrice(shippingCost) : "Gratuita"}</span>
        </div>
        <div className="flex justify-between font-semibold text-zinc-900">
          <span>Totale</span>
          <span>{formatPrice(totale)}</span>
        </div>
      </div>
    </div>
  )
}
