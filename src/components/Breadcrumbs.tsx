import Link from "next/link"
import { COMPANY } from "@/lib/company"

type Segment = {
  label: string
  href?: string
}

function buildSchema(segments: Segment[]) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || `https://${COMPANY.domain}`
  const allSegments = [{ label: "Home", href: "/" }, ...segments]
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: allSegments.map((seg, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: seg.label,
      ...(seg.href ? { item: `${baseUrl}${seg.href}` } : {}),
    })),
  }
}

export function Breadcrumbs({ segments }: { segments: Segment[] }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildSchema(segments)),
        }}
      />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1.5 text-sm text-zinc-500">
          <li>
            <Link href="/" className="transition hover:text-zinc-800">
              Home
            </Link>
          </li>
          {segments.map((seg, i) => (
            <li key={i} className="flex items-center gap-1.5">
              <svg className="h-3 w-3 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
              {seg.href ? (
                <Link href={seg.href} className="transition hover:text-zinc-800">
                  {seg.label}
                </Link>
              ) : (
                <span className="text-zinc-800 font-medium" aria-current="page">
                  {seg.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
