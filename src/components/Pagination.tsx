type PaginationProps = {
  currentPage: number
  totalPages: number
  searchParams: Record<string, string | undefined>
  basePath?: string
}

function getPageUrl(page: number, searchParams: Record<string, string | undefined>, basePath = "/prodotti") {
  const params = new URLSearchParams()
  Object.entries(searchParams).forEach(([key, val]) => {
    if (val && key !== "page") params.set(key, val)
  })
  if (page > 1) params.set("page", String(page))
  const qs = params.toString()
  return `${basePath}${qs ? `?${qs}` : ""}`
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | "...")[] = [1]

  if (current > 3) pages.push("...")

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 2) pages.push("...")

  pages.push(total)

  return pages
}

export function Pagination({ currentPage, totalPages, searchParams, basePath = "/prodotti" }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = getPageNumbers(currentPage, totalPages)

  return (
    <nav aria-label="Paginazione" className="mt-12 flex items-center justify-center gap-1">
      {currentPage > 1 && (
        <a
          href={getPageUrl(currentPage - 1, searchParams, basePath)}
          className="rounded-lg px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100"
        >
          &laquo; Precedente
        </a>
      )}

      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-sm text-zinc-400">
            ...
          </span>
        ) : (
          <a
            key={page}
            href={getPageUrl(page, searchParams, basePath)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              page === currentPage
                ? "bg-primary text-white"
                : "text-zinc-600 hover:bg-zinc-100"
            }`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </a>
        )
      )}

      {currentPage < totalPages && (
        <a
          href={getPageUrl(currentPage + 1, searchParams, basePath)}
          className="rounded-lg px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100"
        >
          Successiva &raquo;
        </a>
      )}
    </nav>
  )
}
