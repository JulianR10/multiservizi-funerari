"use client"

import { usePathname } from "next/navigation"

export function ScrollToTopLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const pathname = usePathname()

  function handleClick(e: React.MouseEvent) {
    if (pathname === "/") {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  )
}
