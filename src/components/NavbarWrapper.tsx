"use client"

import { useEffect, useRef } from "react"

export function NavbarWrapper({ children }: { children: React.ReactNode }) {
  const lastScrollY = useRef(0)
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    lastScrollY.current = window.scrollY

    function onScroll() {
      const nav = navRef.current
      if (!nav) return
      const currentY = window.scrollY
      const delta = currentY - lastScrollY.current
      const isScrollingDown = delta > 0
      const pastThreshold = currentY > 100

      if (isScrollingDown && pastThreshold) {
        nav.style.transform = "translateY(-100%)"
      } else if (!isScrollingDown) {
        nav.style.transform = "translateY(0)"
      }

      lastScrollY.current = currentY
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div
      ref={navRef}
      className="fixed top-0 right-0 left-0 z-50 border-b border-white/20 bg-chalk/60 backdrop-blur-lg transition-transform duration-300"
    >
      {children}
    </div>
  )
}
