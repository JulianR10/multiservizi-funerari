"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { useClickOutside } from "@/hooks/useClickOutside"
import { useCart } from "@/hooks/useCart"

type Category = {
  id: string
  name: string
  slug: string
  children: { id: string; name: string; slug: string }[]
}

export function MobileMenu({ categories, customerSession }: { categories: Category[]; customerSession: boolean }) {
  const { items } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [dropdownTop, setDropdownTop] = useState(0)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      const t = setTimeout(() => setShowContent(true), 80)
      return () => {
        clearTimeout(t)
        document.body.style.overflow = ""
      }
    } else {
      document.body.style.overflow = ""
      const t = setTimeout(() => setShowContent(false), 700)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  useEffect(() => {
    function updatePosition() {
      if (buttonRef.current) {
        const nav = buttonRef.current.closest('nav')
        if (nav) {
          setDropdownTop(nav.getBoundingClientRect().bottom)
        }
      }
    }
    if (isOpen) {
      updatePosition()
      window.addEventListener('resize', updatePosition)
      return () => window.removeEventListener('resize', updatePosition)
    }
  }, [isOpen])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return
    if (e.key === "Escape") {
      close()
      buttonRef.current?.focus()
      return
    }
    if (e.key === "Tab" && dropdownRef.current) {
      const focusable = dropdownRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, handleKeyDown])

  useClickOutside([dropdownRef, buttonRef], close, isOpen)

  function close() {
    setIsOpen(false)
    setCatalogOpen(false)
    setExpanded(null)
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden relative h-10 w-10 p-2 text-primary/80 hover:text-primary cursor-pointer"
        aria-label={isOpen ? "Chiudi menu" : "Apri menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-menu-panel"
      >
        <span className={`absolute left-1/2 top-1/2 block h-0.5 w-5 -translate-x-1/2 bg-current transition-all duration-300 ${isOpen ? 'translate-y-0 rotate-45' : '-translate-y-2'}`} />
        <span className={`absolute left-1/2 top-1/2 block h-0.5 w-5 -translate-x-1/2 -translate-y-1/2 bg-current transition-opacity duration-300 ${isOpen ? 'opacity-0' : ''}`} />
        <span className={`absolute left-1/2 top-1/2 block h-0.5 w-5 -translate-x-1/2 bg-current transition-all duration-300 ${isOpen ? 'translate-y-0 -rotate-45' : 'translate-y-2'}`} />
      </button>

      {mounted && createPortal(
        <div
          ref={dropdownRef}
          id="mobile-menu-panel"
          className="fixed left-0 right-0 z-[60] bg-chalk/60"
          style={{
            top: dropdownTop,
            clipPath: isOpen ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)',
            transition: 'clip-path 0.7s cubic-bezier(0.76, 0, 0.24, 1)',
            pointerEvents: isOpen ? 'auto' : 'none',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <div className="flex max-h-[70vh] w-full flex-col shadow-xl overflow-y-auto">
            <nav aria-label="Navigazione mobile" className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-2">
                <Link
                  href="/#servizi"
                  onClick={close}
                  className="block rounded-lg px-3 py-2 text-center text-base font-medium text-primary hover:bg-zinc-100"
                  style={{
                    opacity: showContent ? 1 : 0,
                    transform: showContent ? 'translateY(0)' : 'translateY(16px)',
                    transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.76, 0, 0.24, 1)',
                    transitionDelay: '0.00s',
                  }}
                >
                  Servizi
                </Link>
                <Link
                  href="/#contatti"
                  onClick={close}
                  className="block rounded-lg px-3 py-2 text-center text-base font-medium text-primary hover:bg-zinc-100"
                  style={{
                    opacity: showContent ? 1 : 0,
                    transform: showContent ? 'translateY(0)' : 'translateY(16px)',
                    transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.76, 0, 0.24, 1)',
                    transitionDelay: '0.02s',
                  }}
                >
                  Contatto
                </Link>
                <button
                  onClick={() => setCatalogOpen(!catalogOpen)}
                  className="flex w-full items-center justify-center gap-1 rounded-lg px-3 py-2 text-center text-base font-medium text-primary hover:bg-zinc-100 cursor-pointer"
                  style={{
                    opacity: showContent ? 1 : 0,
                    transform: showContent ? 'translateY(0)' : 'translateY(16px)',
                    transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.76, 0, 0.24, 1)',
                    transitionDelay: '0.05s',
                  }}
                >
                  Catalogo
                  <svg
                    className={`h-3 w-3 transition-transform duration-200 ${
                      catalogOpen ? "rotate-180" : "rotate-0"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden={true}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {catalogOpen && (
                  <div className="space-y-1">
                    <div className="border-t border-primary/20 pt-2 pb-1">
                      {categories.slice(0, 5).map((cat, idx) => (
                        <div key={cat.id} className="mb-2"
                          style={{
                            opacity: showContent ? 1 : 0,
                            transform: showContent ? 'translateY(0)' : 'translateY(16px)',
                            transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.76, 0, 0.24, 1)',
                            transitionDelay: `${0.10 + idx * 0.05}s`,
                          }}
                        >
                          {cat.children.length > 0 ? (
                            <>
                              <button
                                onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
                                className="flex w-full items-center justify-center gap-1 rounded-lg px-3 py-2 text-center text-sm text-primary italic bg-primary/[0.07] hover:bg-primary/10 cursor-pointer"
                              >
                                {cat.name}
                                <svg
                                  className={`h-3 w-3 text-primary/40 transition-transform duration-200 ${
                                    expanded === cat.id ? "rotate-0" : "-rotate-90"
                                  }`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  aria-hidden={true}
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              {expanded === cat.id && (
                                <ul className="mx-auto mt-1 max-w-xs space-y-1 border-l border-primary/20 pl-3">
                                  <li>
                                    <Link
                                      href={`/prodotti?category=${cat.slug}`}
                                      onClick={close}
                                      className="block rounded-lg px-3 py-2 text-sm font-medium text-primary italic hover:bg-zinc-100"
                                    >
                                      Tutti i {cat.name.toLowerCase()}
                                    </Link>
                                  </li>
                                  {cat.children.map((child) => (
                                    <li key={child.id}>
                                      <Link
                                        href={`/prodotti?category=${child.slug}`}
                                        onClick={close}
                                        className="block rounded-lg px-3 py-2 text-sm text-primary/80 italic hover:bg-zinc-100"
                                      >
                                        {child.name}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </>
                          ) : (
                            <Link
                              href={`/prodotti?category=${cat.slug}`}
                              onClick={close}
                              className="block rounded-lg px-3 py-2 text-center text-sm text-primary italic bg-primary/[0.07] hover:bg-primary/10"
                            >
                              {cat.name}
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="text-center"
                      style={{
                        opacity: showContent ? 1 : 0,
                        transform: showContent ? 'translateY(0)' : 'translateY(16px)',
                        transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.76, 0, 0.24, 1)',
                        transitionDelay: '0.35s',
                      }}
                    >
                      <Link
                        href="/prodotti"
                        onClick={close}
                        className="inline-block rounded-[7px] bg-primary px-4 py-2 text-base font-medium text-chalk shadow-sm hover:bg-primary-hover"
                      >
                        Ver catalogo →
                      </Link>
                    </div>
                  </div>
                )}
                {customerSession ? (
                  <Link
                    href="/account"
                    onClick={close}
                    className="block rounded-lg px-3 py-2 text-center text-base font-medium text-primary hover:bg-zinc-100"
                    style={{
                      opacity: showContent ? 1 : 0,
                      transform: showContent ? 'translateY(0)' : 'translateY(16px)',
                      transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.76, 0, 0.24, 1)',
                      transitionDelay: '0.40s',
                    }}
                  >
                    Account
                  </Link>
                ) : (
                  <Link
                    href="/auth/login"
                    onClick={close}
                    className="block rounded-[7px] bg-primary px-3 py-2 text-center text-base font-medium text-chalk hover:bg-primary-hover"
                    style={{
                      opacity: showContent ? 1 : 0,
                      transform: showContent ? 'translateY(0)' : 'translateY(16px)',
                      transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.76, 0, 0.24, 1)',
                      transitionDelay: '0.40s',
                    }}
                  >
                    Accedi
                  </Link>
                )}
                {items.length > 0 && (
                <Link
                  href="/carrello"
                  onClick={close}
                  className="block rounded-lg px-3 py-2 text-center text-base font-medium text-primary hover:bg-zinc-100"
                  style={{
                    opacity: showContent ? 1 : 0,
                    transform: showContent ? 'translateY(0)' : 'translateY(16px)',
                    transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.76, 0, 0.24, 1)',
                    transitionDelay: '0.45s',
                  }}
                >
                  Carrello
                </Link>
                )}
              </div>
            </nav>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
