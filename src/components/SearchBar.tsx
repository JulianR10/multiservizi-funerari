"use client"

import { useRef } from "react"
import { useSearch } from "@/hooks/useSearch"
import { SearchResultsDropdown } from "@/components/SearchResults"
import { useClickOutside } from "@/hooks/useClickOutside"

export function SearchBar({ q, large }: { q?: string; large?: boolean }) {
  const {
    query,
    setQuery,
    results,
    selectedIndex,
    setSelectedIndex,
    isOpen,
    setIsOpen,
    inputRef,
    totalItems,
    navigate,
    handleKeyDown: hookKeyDown,
  } = useSearch(q ?? "")

  const formRef = useRef<HTMLFormElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useClickOutside([dropdownRef, formRef], () => setIsOpen(false))

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen && e.key === "Enter") {
      formRef.current?.requestSubmit()
      return
    }
    if (!isOpen) return
    hookKeyDown(e)
  }

  const hasResults = totalItems > 0

  return (
    <form ref={formRef} action="/prodotti" method="GET" className="relative w-full">
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
        <div ref={dropdownRef} className="absolute left-0 right-0 top-full z-50 mt-1">
          <SearchResultsDropdown
            results={results}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            navigate={navigate}
            query={query}
            totalItems={totalItems}
          />
        </div>
      )}
    </form>
  )
}
