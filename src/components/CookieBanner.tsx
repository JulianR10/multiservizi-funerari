"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem("cookie-banner-dismissed")
    if (!dismissed) setVisible(true)
  }, [])

  function dismiss() {
    localStorage.setItem("cookie-banner-dismissed", "true")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-chalk px-4 py-4 shadow-lg sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-600">
          Questo sito utilizza cookie tecnici necessari al funzionamento. Leggi la{" "}
          <Link href="/cookies" className="font-medium text-primary underline hover:text-primary-hover">
            Cookie Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={dismiss}
            className="cursor-pointer rounded-full bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Ho capito
          </button>
        </div>
      </div>
    </div>
  )
}
