"use client"

import Link from "next/link"
import { useState } from "react"

type CategoryItem = {
  id: string
  name: string
  slug: string
  children: { id: string; name: string; slug: string }[]
}

export function CategorySidebar({
  categories,
  activeCategory,
}: {
  categories: CategoryItem[]
  activeCategory?: string
}) {
  const initialExpanded = categories
    .filter(
      (cat) =>
        activeCategory === cat.slug ||
        cat.children.some((child) => child.slug === activeCategory)
    )
    .map((cat) => cat.id)

  const [expanded, setExpanded] = useState<string[]>(initialExpanded)

  function toggle(id: string) {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  return (
    <div className="space-y-0.5">
      <Link
        href="/products"
        className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
          !activeCategory
            ? "bg-primary text-white"
            : "text-zinc-600 hover:bg-zinc-100"
        }`}
      >
        Tutti i prodotti
      </Link>
      {categories.map((cat) => (
        <div key={cat.id}>
          <div className="flex items-center">
            <Link
              href={`/products?category=${cat.slug}`}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                activeCategory === cat.slug
            ? "bg-primary text-white"
                  : "text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              {cat.name}
            </Link>
            {cat.children.length > 0 && (
              <button
                onClick={() => toggle(cat.id)}
                className="cursor-pointer p-2 text-zinc-400 hover:text-zinc-700"
                aria-label={expanded.includes(cat.id) ? "Comprimi" : "Espandi"}
              >
                <svg
                  className={`h-3 w-3 transition-transform duration-200 ${
                    expanded.includes(cat.id) ? "rotate-0" : "-rotate-90"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
          {expanded.includes(cat.id) && cat.children.length > 0 && (
            <div className="ml-3 border-l border-zinc-200 pl-3">
              {cat.children.map((child) => (
                <Link
                  key={child.id}
                  href={`/products?category=${child.slug}`}
                  className={`block rounded-lg px-3 py-1.5 text-sm transition ${
                    activeCategory === child.slug
                      ? "font-medium text-primary"
                      : "text-zinc-500 hover:text-zinc-700"
                  }`}
                >
                  {child.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
