"use client"

import { usePathname } from "next/navigation"

function isAdminRoute(pathname: string) {
  return pathname.startsWith("/admin")
}

export function HideOnAdmin({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const pathname = usePathname()
  if (isAdminRoute(pathname)) return fallback ?? null
  return <>{children}</>
}

export function MainWithPadding({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <main id="main-content" className={`flex-1 ${isAdminRoute(pathname) ? "" : "pt-[70px]"}`} style={{ viewTransitionName: `page-${pathname.replace(/\//g, "-").replace(/^-/, "") || "home"}` }}>
      {children}
    </main>
  )
}
