import type { ReactNode } from "react"

export function LegalPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <article className="prose prose-zinc max-w-none">{children}</article>
    </div>
  )
}
