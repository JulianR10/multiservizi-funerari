"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

const SECTIONS = ["chi-siamo", "servizi", "contatti"]

export function NavbarActiveSection() {
  const pathname = usePathname()
  const isHome = pathname === "/"

  useEffect(() => {
    if (!isHome) return

    const links = SECTIONS.map((id) =>
      document.querySelector<HTMLAnchorElement>(`nav a[href="#${id}"]`)
    ).filter(Boolean) as HTMLAnchorElement[]

    const observers = SECTIONS.map((id) => {
      const el = document.getElementById(id)
      if (!el) return null

      const observer = new IntersectionObserver(
        ([entry]) => {
          links.forEach((l) => {
            const isTarget = l.getAttribute("href") === `#${id}`
            l.classList.toggle("text-primary", isTarget && entry.isIntersecting)
            l.classList.toggle("font-semibold", isTarget && entry.isIntersecting)
            if (!isTarget && entry.isIntersecting) {
              l.classList.remove("text-primary", "font-semibold")
            }
          })
        },
        { threshold: 0.3, rootMargin: "-80px 0px 0px 0px" }
      )

      observer.observe(el)
      return observer
    }).filter(Boolean) as IntersectionObserver[]

    return () => observers.forEach((o) => o.disconnect())
  }, [isHome])

  return null
}
