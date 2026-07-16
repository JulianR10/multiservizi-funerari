"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"

export type CategoryResult = {
  id: string
  name: string
  slug: string
  image: string | null
}

export type ProductResult = {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
  category: { name: string }
}

export type SearchResults = {
  products: ProductResult[]
  categories: CategoryResult[]
}

export type GroupedItem =
  | (CategoryResult & { type: "category" })
  | (ProductResult & { type: "product" })

export function useSearch(initialQuery = "") {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResults | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const totalItems =
    (results?.categories.length ?? 0) + (results?.products.length ?? 0)

  const groupedItems: GroupedItem[] = [
    ...(results?.categories.map((c) => ({ ...c, type: "category" as const })) ?? []),
    ...(results?.products.map((p) => ({ ...p, type: "product" as const })) ?? []),
  ]

  const fetchResults = useCallback(async () => {
    if (!query.trim()) {
      setResults(null)
      setSelectedIndex(-1)
      return
    }
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data: SearchResults = await res.json()
      setResults(data)
      setSelectedIndex(-1)
    } catch {
      setResults(null)
    }
  }, [query])

  useEffect(() => {
    if (!query.trim()) {
      setResults(null)
      setSelectedIndex(-1)
      setIsOpen(false)
      return
    }
    const timer = setTimeout(fetchResults, 150)
    return () => clearTimeout(timer)
  }, [query, fetchResults])

  useEffect(() => {
    if (results && query.trim()) {
      setIsOpen(true)
    }
  }, [results, query])

  function navigate(url: string) {
    setQuery("")
    setResults(null)
    setSelectedIndex(-1)
    setIsOpen(false)
    router.push(url)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || totalItems === 0) return

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
        }
        break
    }
  }

  return {
    query,
    setQuery,
    results,
    selectedIndex,
    setSelectedIndex,
    isOpen,
    setIsOpen,
    inputRef,
    totalItems,
    groupedItems,
    navigate,
    handleKeyDown,
  }
}
