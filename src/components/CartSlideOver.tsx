"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { useClickOutside } from "@/hooks/useClickOutside"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/hooks/useCart"
import { formatPrice } from "@/lib/format"
import { computeTax } from "@/lib/tax"
import { ShippingEstimate } from "@/components/ShippingEstimate"

export function CartSlideOver() {
  const { items, openSlideOver, setSlideOver, removeItem, totalPrice } = useCart()
  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!openSlideOver) return
    closeButtonRef.current?.focus()
  }, [openSlideOver])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!openSlideOver) return
    if (e.key === "Escape") {
      setSlideOver(false)
      return
    }
    if (e.key === "Tab" && panelRef.current) {
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }, [openSlideOver, setSlideOver])

  useEffect(() => {
    if (!openSlideOver) return
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [openSlideOver, handleKeyDown])

  useClickOutside(panelRef, () => setSlideOver(false), openSlideOver)

  useEffect(() => {
    if (openSlideOver) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [openSlideOver])

  const count = items.reduce((acc, i) => acc + i.quantity, 0)

  return (
    <>
      {openSlideOver && (
        <div className="fixed inset-0 z-60 bg-black/40 transition-opacity duration-300" />
      )}
      <div
        ref={panelRef}
        className={`fixed right-0 top-0 z-70 flex h-full w-full max-w-md flex-col bg-chalk shadow-2xl transition-transform duration-300 ease-out ${
          openSlideOver ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <h2 className="font-heading text-lg font-semibold text-zinc-900">
            Carrello {count > 0 && <span className="text-sm text-zinc-400">({count})</span>}
          </h2>
          <button
            ref={closeButtonRef}
            onClick={() => setSlideOver(false)}
            className="cursor-pointer rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Chiudi carrello"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden={true}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!mounted ? null : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
            <svg className="h-14 w-14 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} aria-hidden={true}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
            <p className="text-zinc-500">Il carrello è vuoto.</p>
            <Link
              href="/prodotti"
              onClick={() => setSlideOver(false)}
              className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-hover"
            >
              Visualizza i prodotti
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-6 py-4">
              {items.map((item) => (
                <li key={item.productId} className="flex items-center gap-3 py-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-zinc-300">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden={true}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900">{item.name}</p>
                    <p className="text-xs text-zinc-500">x{item.quantity} — {formatPrice(item.price)}</p>
                    {item.stock > 0 && item.stock <= 3 && (
                      <p className="mt-0.5 text-[11px] text-amber-600">Solo {item.stock} rimasti</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="cursor-pointer p-1 text-zinc-400 hover:text-red-600"
                    aria-label={`Rimuovi ${item.name}`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden={true}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
            <div className="border-t border-zinc-200 px-6 py-4">
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-zinc-500">
                  <span>Subtotale</span>
                  <span>{formatPrice(totalPrice())}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-500">
                  <span>IVA (22%)</span>
                  <span>{formatPrice(computeTax(totalPrice()))}</span>
                </div>
                <ShippingEstimate subtotal={totalPrice()} />
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-zinc-200 pt-2">
                <span className="text-sm font-medium text-zinc-700">Totale</span>
                <span className="text-xl font-bold text-zinc-900">{formatPrice(totalPrice() + computeTax(totalPrice()))}</span>
              </div>
              <Link
                href="/checkout"
                onClick={() => setSlideOver(false)}
                className="mt-3 block w-full rounded-full bg-primary px-6 py-3 text-center text-sm font-medium text-white hover:bg-primary-hover"
              >
                Vai al checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  )
}
