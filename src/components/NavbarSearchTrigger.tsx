"use client"

import { useEffect, useRef, useState } from "react"
import { useSearch } from "@/hooks/useSearch"
import { SearchResultsDropdown } from "@/components/SearchResults"
import { useClickOutside } from "@/hooks/useClickOutside"

export function NavbarSearchTrigger() {
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
  } = useSearch()

  const [showInput, setShowInput] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (showInput) inputRef.current?.focus()
  }, [showInput, inputRef])

  useClickOutside(containerRef, () => { setShowInput(false); setQuery(""); setIsOpen(false) })

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setShowInput(false)
      setQuery("")
      setIsOpen(false)
      return
    }
    if (e.key === "Enter" && selectedIndex < 0 && query.trim()) {
      e.preventDefault()
      navigate(`/prodotti?q=${encodeURIComponent(query.trim())}`)
      setShowInput(false)
      return
    }
    hookKeyDown(e)
  }

  function closeSearch() {
    setShowInput(false)
    setQuery("")
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="flex items-center">
      {showInput ? (
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

          {isOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-80">
              <SearchResultsDropdown
                results={results}
                selectedIndex={selectedIndex}
                setSelectedIndex={setSelectedIndex}
                navigate={navigate}
                query={query}
                totalItems={totalItems}
                onItemClick={closeSearch}
              />
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className="cursor-pointer text-primary/80 transition-colors hover:text-primary"
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
