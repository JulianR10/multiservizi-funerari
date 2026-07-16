"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const TABS = [
  { href: "/account/orders", label: "I miei ordini" },
  { href: "/account/profile", label: "Dati azienda" },
  { href: "/account/addresses", label: "Indirizzi" },
  { href: "/account/security", label: "Sicurezza" },
]

export function AccountTabs({ status }: { status: string }) {
  const pathname = usePathname()

  if (status !== "APPROVED") {
    return null
  }

  return (
    <nav className="border-b border-zinc-200">
      <ul className="-mb-px flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {TABS.map((tab) => {
          const isActive =
            pathname === tab.href || (tab.href !== "/account" && pathname?.startsWith(tab.href))
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`inline-flex items-center border-b-2 px-1 pb-3 pt-2 font-medium transition ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700"
                }`}
              >
                {tab.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
