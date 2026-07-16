"use client"

import { useEffect, useState, useRef } from "react"
import { useCart } from "@/hooks/useCart"

export function CartButton() {
  const { items, setSlideOver, openSlideOver } = useCart()
  const [mounted, setMounted] = useState(false)
  const [pulse, setPulse] = useState(false)
  const prevCount = useRef(0)

  useEffect(() => setMounted(true), [])

  const count = items.reduce((acc, item) => acc + item.quantity, 0)

  useEffect(() => {
    if (mounted && count > prevCount.current) {
      setPulse(true)
      const t = setTimeout(() => setPulse(false), 400)
      prevCount.current = count
      return () => clearTimeout(t)
    }
    prevCount.current = count
  }, [count, mounted])

  if (!mounted) return null
  if (count === 0) return null

  return (
    <button
      onClick={() => setSlideOver(!openSlideOver)}
      className="relative cursor-pointer text-primary/80 hover:text-primary"
      aria-label={count > 0 ? `Hai ${count} articoli nel carrello` : "Carrello vuoto"}
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
      </svg>
      {count > 0 && (
        <span
          key={count}
          className={`absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white ${
            pulse ? "animate-pulse-subtle" : ""
          }`}
        >
          {count}
        </span>
      )}
    </button>
  )
}
