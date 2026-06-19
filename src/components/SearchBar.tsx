"use client"

import { useRouter } from "next/navigation"
import { useRef, useState, useEffect, useCallback } from "react"

type SearchResult = {
  products: Array<{
    id: string
    name: string
    slug: string
    price: number
    images: string[]
    category: { name: string }
  }>
  categories: Array<{
    id: string
    name: string
    slug: string
    image: string | null
  }>
}

export function SearchBar({ q, large }: { q?: string; large?: boolean }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [query, setQuery] = useState(q ?? "")
  const [results, setResults] = useState<SearchResult | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const totalItems =
    (results?.categories.length ?? 0) + (results?.products.length ?? 0)

  const groupedItems = [
    ...(results?.categories.map((c) => ({ type: "category" as const, ...c })) ?? []),
    ...(results?.products.map((p) => ({ type: "product" as const, ...p })) ?? []),
  ]

  const fetchResults = useCallback(async (value: string) => {
    if (value.length < 1) {
      setResults(null)
      setIsOpen(false)
      return
    }
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`)
      const data: SearchResult = await res.json()
      setResults(data)
      setIsOpen(true)
      setSelectedIndex(-1)
    } catch {
      setResults(null)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => fetchResults(query), 150)
    return () => clearTimeout(timer)
  }, [query, fetchResults])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        formRef.current &&
        !formRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function navigate(url: string) {
    setIsOpen(false)
    setResults(null)
    setSelectedIndex(-1)
    router.push(url)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || totalItems === 0) {
      if (e.key === "Enter") {
        formRef.current?.requestSubmit()
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1))
        break
      case "Escape":
        setIsOpen(false)
        inputRef.current?.blur()
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < groupedItems.length) {
          const item = groupedItems[selectedIndex]
          if (item.type === "category") {
            navigate(`/products?category=${item.slug}`)
          } else {
            navigate(`/products/${item.slug}`)
          }
        } else {
          formRef.current?.requestSubmit()
        }
        break
    }
  }

  const hasResults = totalItems > 0

  return (
    <form ref={formRef} action="/products" method="GET" className="relative w-full">
      <svg
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
      <input
        ref={inputRef}
        name="q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => { if (hasResults) setIsOpen(true) }}
        onKeyDown={handleKeyDown}
        placeholder="Cerca prodotti e categorie..."
        autoComplete="off"
        className={`w-full rounded-lg border border-zinc-200 bg-chalk pr-4 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none ${
          large ? "px-5 py-3 pl-12 text-base" : "px-4 py-2 pl-10 text-sm"
        }`}
      />

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-zinc-200 bg-chalk shadow-lg"
        >
          {!hasResults && query.length > 0 && (
            <p className="px-4 py-8 text-center text-sm text-zinc-400">
              Nessun risultato per &quot;{query}&quot;
            </p>
          )}

          {results && results.categories.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Categorie
              </p>
              {results.categories.map((cat, i) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => navigate(`/products?category=${cat.slug}`)}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition ${
                    selectedIndex === i ? "bg-zinc-100" : ""
                  }`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm">
                    {cat.image ? (
                      <img src={cat.image} alt="" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      "📁"
                    )}
                  </span>
                  <span className="font-medium text-zinc-900">{cat.name}</span>
                </button>
              ))}
            </div>
          )}

          {results && results.products.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Prodotti
              </p>
              {results.products.map((prod, i) => {
                const idx = (results.categories?.length ?? 0) + i
                return (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => navigate(`/products/${prod.slug}`)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition ${
                      selectedIndex === idx ? "bg-zinc-100" : ""
                    }`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-100">
                      {prod.images[0] ? (
                        <img src={prod.images[0]} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-sm">📦</span>
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-zinc-900">{prod.name}</span>
                      <span className="ml-2 text-xs text-zinc-400">{prod.category.name}</span>
                    </div>
                    <span className="shrink-0 text-sm font-medium text-zinc-700">
                      €{prod.price}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </form>
  )
}
