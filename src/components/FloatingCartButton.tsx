"use client"

import { useEffect, useState } from "react"
import { useCart } from "@/hooks/useCart"

export function FloatingCartButton() {
  const { items, setSlideOver } = useCart()
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => setMounted(true), [])

  const count = items.reduce((acc, item) => acc + item.quantity, 0)

  useEffect(() => {
    if (mounted && count > 0) {
      const t = setTimeout(() => setVisible(true), 100)
      return () => clearTimeout(t)
    }
    setVisible(false)
  }, [count, mounted])

  if (!mounted || count === 0) return null

  return (
    <button
      onClick={() => setSlideOver(true)}
      className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg transition-all duration-300 hover:bg-zinc-800 active:scale-95 md:hidden ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
      aria-label={`Hai ${count} articoli nel carrello`}
    >
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
      </svg>
      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white ring-2 ring-chalk">
        {count}
      </span>
    </button>
  )
}
