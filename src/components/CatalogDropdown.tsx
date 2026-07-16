"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { useClickOutside } from "@/hooks/useClickOutside"

type Category = {
  id: string
  name: string
  slug: string
  children: { id: string; name: string; slug: string }[]
}

export function CatalogDropdown({ categories }: { categories: Category[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useClickOutside(ref, () => { setIsOpen(false) }, isOpen)

  return (
    <div
      ref={ref}
      className="relative hidden md:block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => { setIsOpen(false) }}
    >
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex cursor-pointer items-center gap-1 text-sm font-medium text-primary/80 hover:text-primary"
      >
        Catalogo
        <svg className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden={true}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={`absolute left-0 top-full z-50 w-64 rounded-lg border border-zinc-200 bg-chalk py-2 shadow-lg transition-all ${
          isOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <Link
          href="/prodotti"
          onClick={() => setIsOpen(false)}
          className="block px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
        >
          Tutti i prodotti
        </Link>
        <hr className="mx-4 my-1 border-zinc-200" />
        {categories.map((cat) => (
          <div key={cat.id} className="group/sub relative">
            <Link
              href={`/prodotti?category=${cat.slug}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
            >
              {cat.name}
              {cat.children.length > 0 && (
                <svg className="h-3 w-3 -rotate-90 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden={true}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </Link>
            {cat.children.length > 0 && (
              <div className="invisible absolute left-full top-0 z-50 w-56 rounded-lg border border-zinc-200 bg-chalk py-2 shadow-lg opacity-0 transition-all group-hover/sub:visible group-hover/sub:opacity-100">
                {cat.children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/prodotti?category=${child.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
