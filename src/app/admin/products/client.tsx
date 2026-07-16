"use client"

import { useState, useTransition, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatPrice } from "@/lib/format"
import { DeleteProductButton } from "@/components/DeleteProductButton"
import { Pagination } from "@/components/Pagination"
import { toast } from "sonner"
import {
  bulkPublishProducts,
  bulkUnpublishProducts,
  bulkDeleteProducts,
} from "@/app/actions/admin-products-bulk"

type Product = {
  id: string
  name: string
  category: { name: string }
  price: number
  stock: number
  published: boolean
}

type Props = {
  initialProducts: Product[]
  total: number
  currentPage: number
  totalPages: number
  q: string
}

const LOW_STOCK_THRESHOLD = 5

export function AdminProductsClient({
  initialProducts,
  total,
  currentPage,
  totalPages,
  q,
}: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState(q)
  const [showLowStock, setShowLowStock] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const t = setTimeout(() => {
      if (search !== q) {
        const params = new URLSearchParams()
        if (search) params.set("q", search)
        if (showLowStock) params.set("q", "lowstock")
        router.push(`/admin/products?${params.toString()}`)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [search, showLowStock, q, router])

  const filtered = showLowStock
    ? initialProducts.filter((p) => p.stock <= LOW_STOCK_THRESHOLD)
    : initialProducts

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map((p) => p.id)))
    }
  }

  function toggleOne(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  function runBulk(action: "publish" | "unpublish" | "delete") {
    const ids = Array.from(selected)
    if (ids.length === 0) return

    const labels = { publish: "pubblicare", unpublish: "disattivare", delete: "eliminare" }
    if (!confirm(`Confermi di ${labels[action]} ${ids.length} prodott${ids.length === 1 ? "o" : "i"}?`)) return

    startTransition(async () => {
      const fn = action === "publish"
        ? bulkPublishProducts(ids)
        : action === "unpublish"
          ? bulkUnpublishProducts(ids)
          : bulkDeleteProducts(ids)
      const result = await fn
      if (result.success) {
        toast.success(`${result.affected} prodott${result.affected === 1 ? "o aggiornato" : "i aggiornati"}`)
        setSelected(new Set())
        router.refresh()
      } else {
        toast.error(result.error || "Errore")
      }
    })
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-zinc-900">Gestione Prodotti</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/new"
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Nuovo prodotto
          </Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca prodotto..."
          className="block w-full max-w-xs rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
        />
        <label className="inline-flex items-center gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={showLowStock}
            onChange={(e) => setShowLowStock(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300"
          />
          Solo stock basso
        </label>
        <p className="ml-auto text-sm text-zinc-500">
          {total} prodott{total === 1 ? "o" : "i"}
          {showLowStock && ` · ${filtered.length} con stock ≤ ${LOW_STOCK_THRESHOLD}`}
        </p>
      </div>

      {selected.size > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-zinc-300 bg-zinc-100 px-4 py-3">
          <span className="text-sm font-medium text-zinc-700">
            {selected.size} selezionat{selected.size === 1 ? "o" : "i"}
          </span>
          <div className="ml-auto flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => runBulk("publish")}
              disabled={isPending}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              Pubblica
            </button>
            <button
              type="button"
              onClick={() => runBulk("unpublish")}
              disabled={isPending}
              className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              Disattiva
            </button>
            <button
              type="button"
              onClick={() => runBulk("delete")}
              disabled={isPending}
              className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              Elimina
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Annulla
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && selected.size === filtered.length}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-zinc-300"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-zinc-500">
                Prodotto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-zinc-500">
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-zinc-500">
                Prezzo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-zinc-500">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-zinc-500">
                Stato
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-zinc-500">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-chalk">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-sm text-zinc-500">
                  {showLowStock
                    ? `Nessun prodotto con stock ≤ ${LOW_STOCK_THRESHOLD}.`
                    : "Nessun prodotto."}
                </td>
              </tr>
            ) : (
              filtered.map((product) => (
                <tr
                  key={product.id}
                  className={`hover:bg-zinc-50 ${selected.has(product.id) ? "bg-amber-50/50" : ""}`}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selected.has(product.id)}
                      onChange={() => toggleOne(product.id)}
                      className="h-4 w-4 rounded border-zinc-300"
                    />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-zinc-900">
                    {product.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500">
                    {product.category.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-900">
                    {formatPrice(product.price)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span
                      className={
                        product.stock === 0
                          ? "font-semibold text-red-700"
                          : product.stock <= LOW_STOCK_THRESHOLD
                            ? "font-semibold text-amber-700"
                            : "text-zinc-500"
                      }
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        product.published
                          ? "bg-green-100 text-green-700"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {product.published ? "Pubblicato" : "Bozza"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="font-medium text-zinc-900 hover:text-zinc-600"
                    >
                      Modifica
                    </Link>
                    <DeleteProductButton productId={product.id} productName={product.name} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          searchParams={{}}
          basePath="/admin/products"
        />
      )}
    </>
  )
}
