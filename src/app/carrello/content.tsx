"use client"

import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { useCart, type CartItem } from "@/hooks/useCart"
import { formatPrice } from "@/lib/format"
import { computeTax } from "@/lib/tax"
import { ShippingEstimate } from "@/components/ShippingEstimate"

export function CartContent() {
  const { items, updateQuantity, removeItem, addItem, totalPrice } = useCart()

  function handleRemove(item: CartItem) {
    const fullItem = items.find((i) => i.productId === item.productId)
    removeItem(item.productId)
    toast("Prodotto rimosso", {
      description: item.name,
      action: fullItem ? {
        label: "Annulla",
        onClick: () => addItem({ productId: fullItem.productId, name: fullItem.name, price: fullItem.price, image: fullItem.image, slug: fullItem.slug, stock: fullItem.stock }),
      } : undefined,
      duration: 5000,
    })
  }

  if (items.length === 0) {
    return (
      <div className="mt-12 text-center">
        <svg className="mx-auto h-16 w-16 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} aria-hidden={true}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
        </svg>
        <p className="mt-4 text-zinc-500">Il carrello è vuoto.</p>
        <Link
          href="/prodotti"
          className="mt-4 inline-block rounded-full bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Visualizza i prodotti
        </Link>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <ul className="divide-y divide-zinc-200">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center gap-4 py-4">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-zinc-300">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-900">{item.name}</p>
              <p className="text-sm text-zinc-500">{formatPrice(item.price)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 text-sm hover:bg-zinc-100"
                aria-label="Diminuisci quantità"
              >
                -
              </button>
              <span className="w-8 text-center text-sm">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 text-sm hover:bg-zinc-100"
                aria-label="Aumenta quantità"
              >
                +
              </button>
            </div>
            <p className="w-24 text-right text-sm font-medium text-zinc-900">
              {formatPrice(item.price * item.quantity)}
            </p>
            <button
              onClick={() => handleRemove(item)}
              className="cursor-pointer text-xs text-red-600 hover:text-red-500"
            >
              Rimuovi
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 text-center">
        <Link
          href="/prodotti"
          className="text-sm text-primary hover:text-primary-hover"
        >
          &larr; Continua gli acquisti
        </Link>
      </div>

      <div className="sticky bottom-0 mt-6 border-t border-zinc-200 bg-chalk pt-6 lg:static lg:border-t lg:pt-6">
        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between text-zinc-600">
            <span>Subtotale</span>
            <span>{formatPrice(totalPrice())}</span>
          </div>
          <div className="flex items-center justify-between text-zinc-600">
            <span>IVA (22%)</span>
            <span>{formatPrice(computeTax(totalPrice()))}</span>
          </div>
          <ShippingEstimate subtotal={totalPrice()} />
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-zinc-200 pt-3">
          <span className="text-lg font-semibold text-zinc-900">Totale</span>
          <span className="text-2xl font-bold text-zinc-900">{formatPrice(totalPrice() + computeTax(totalPrice()))}</span>
        </div>

        <div className="mt-4 flex items-center justify-center gap-3 text-xs text-zinc-400">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <span>Pagamento sicuro con Stripe</span>
          <span className="text-zinc-300">|</span>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          <span>Dati protetti</span>
        </div>

        <div className="mt-6">
          <Link
            href="/checkout"
            className="block w-full rounded-full bg-zinc-900 px-6 py-3 text-center text-sm font-medium text-white hover:bg-zinc-800"
          >
            Vai al checkout
          </Link>
        </div>
      </div>
    </div>
  )
}
