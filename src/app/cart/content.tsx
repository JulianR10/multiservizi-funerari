"use client"

import Link from "next/link"
import { useCart } from "@/hooks/useCart"
import { formatPrice } from "@/lib/format"

export function CartContent() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart()

  if (items.length === 0) {
    return (
      <div className="mt-12 text-center">
        <p className="text-zinc-500">Il carrello è vuoto.</p>
        <Link
          href="/products"
          className="mt-4 inline-block rounded-full bg-zinc-900 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Scopri i prodotti
        </Link>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <ul className="divide-y divide-zinc-200">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center gap-4 py-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-900">{item.name}</p>
              <p className="text-sm text-zinc-500">{formatPrice(item.price)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                className="h-8 w-8 rounded-full border border-zinc-300 text-sm hover:bg-zinc-100"
              >
                -
              </button>
              <span className="w-8 text-center text-sm">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                className="h-8 w-8 rounded-full border border-zinc-300 text-sm hover:bg-zinc-100"
              >
                +
              </button>
            </div>
            <p className="w-24 text-right text-sm font-medium text-zinc-900">
              {formatPrice(item.price * item.quantity)}
            </p>
            <button
              onClick={() => removeItem(item.productId)}
              className="cursor-pointer text-xs text-red-600 hover:text-red-500"
            >
              Rimuovi
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-8 border-t border-zinc-200 pt-6">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-zinc-900">Totale</span>
          <span className="text-2xl font-bold text-zinc-900">{formatPrice(totalPrice())}</span>
        </div>
        <Link
          href="/checkout"
          className="mt-6 block w-full rounded-full bg-zinc-900 px-6 py-3 text-center text-sm font-medium text-white hover:bg-zinc-800"
        >
          Procedi al checkout
        </Link>
      </div>
    </div>
  )
}
