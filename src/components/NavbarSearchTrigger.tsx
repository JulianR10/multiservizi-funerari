"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

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

export function NavbarSearchTrigger() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery("")
        setResults(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchResults = useCallback(async (value: string) => {
    if (value.length < 1) {
      setResults(null)
      return
    }
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`)
      const data: SearchResult = await res.json()
      setResults(data)
      setSelectedIndex(-1)
    } catch {
      setResults(null)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => fetchResults(query), 150)
    return () => clearTimeout(timer)
  }, [query, fetchResults])

  const totalItems =
    (results?.categories.length ?? 0) + (results?.products.length ?? 0)

  const groupedItems = [
    ...(results?.categories.map((c) => ({ type: "category" as const, ...c })) ?? []),
    ...(results?.products.map((p) => ({ type: "product" as const, ...p })) ?? []),
  ]

  function navigate(url: string) {
    setOpen(false)
    setQuery("")
    setResults(null)
    router.push(url)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
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
        setOpen(false)
        setQuery("")
        setResults(null)
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
        } else if (query.trim()) {
          navigate(`/products?q=${encodeURIComponent(query.trim())}`)
        }
        break
    }
  }

  return (
    <div ref={containerRef} className="flex items-center">
      {open ? (
        <div className="relative">
          <div className="flex items-center">
            <svg className="h-4 w-4 shrink-0 text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Cerca prodotti..."
              className="ml-1.5 w-32 bg-transparent text-sm text-zinc-900 placeholder-primary/60 outline-none lg:w-48"
            />
          </div>

          {totalItems > 0 && (
            <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-zinc-200 bg-chalk shadow-lg">
              {results && results.categories.length > 0 && (
                <div>
                  <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
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
                  <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
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

          {query.length > 0 && totalItems === 0 && (
            <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-zinc-200 bg-chalk px-4 py-8 text-center text-sm text-zinc-400 shadow-lg">
              Nessun risultato per &quot;{query}&quot;
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="cursor-pointer p-1.5 text-primary/80 transition-colors hover:text-primary"
          aria-label="Cerca"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </button>
      )}
    </div>
  )
}
