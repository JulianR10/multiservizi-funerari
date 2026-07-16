"use client"

import { formatPrice } from "@/lib/format"
import type { SearchResults as SearchResultsType } from "@/hooks/useSearch"

type Props = {
  results: SearchResultsType | null
  selectedIndex: number
  setSelectedIndex: (i: number) => void
  navigate: (url: string) => void
  query: string
  totalItems: number
  onItemClick?: () => void
}

export function SearchResultsDropdown({
  results,
  selectedIndex,
  setSelectedIndex,
  navigate,
  query,
  totalItems,
  onItemClick,
}: Props) {
  if (!results) return null

  const hasResults = totalItems > 0

  if (!hasResults && query.length > 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-chalk px-4 py-8 text-center text-sm text-zinc-400 shadow-lg">
        <svg className="mx-auto h-10 w-10 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} aria-hidden={true}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <p className="mt-3">Nessun risultato per &quot;{query}&quot;</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-chalk shadow-lg" role="listbox">
      {results.categories.length > 0 && (
        <div>
          <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Categorie
          </p>
          {results.categories.map((cat, i) => (
            <button
              key={cat.id}
              type="button"
              role="option"
              aria-selected={selectedIndex === i}
              onClick={() => { navigate(`/prodotti?category=${cat.slug}`); onItemClick?.() }}
              onMouseEnter={() => setSelectedIndex(i)}
              className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition ${
                selectedIndex === i ? "bg-zinc-100" : ""
              }`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100">
                {cat.image ? (
                  <img src={cat.image} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden={true}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                  </svg>
                )}
              </span>
              <span className="font-medium text-zinc-900">{cat.name}</span>
            </button>
          ))}
        </div>
      )}

      {results.products.length > 0 && (
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
                role="option"
                aria-selected={selectedIndex === idx}
                onClick={() => { navigate(`/prodotti/${prod.slug}`); onItemClick?.() }}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition ${
                  selectedIndex === idx ? "bg-zinc-100" : ""
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-100">
                  {prod.images[0] ? (
                    <img src={prod.images[0]} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden={true}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                    </svg>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-zinc-900">{prod.name}</span>
                  <span className="ml-2 text-xs text-zinc-400">{prod.category.name}</span>
                </div>
                <span className="shrink-0 text-sm font-medium text-zinc-700">
                  {formatPrice(prod.price)}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
