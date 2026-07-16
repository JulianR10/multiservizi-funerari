"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatPrice } from "@/lib/format"
import { STATUS_LABELS, STATUS_COLORS, STATUS_OPTIONS } from "@/lib/order-status"
import { updateOrder, exportOrdersCSV } from "@/app/actions/admin"

type Order = {
  id: string
  invoiceNumber: string | null
  user: { name: string | null; email: string | null } | null
  guestEmail: string | null
  total: number
  status: string
  paymentStatus: string
  trackingNumber: string | null
  trackingUrl: string | null
  createdAt: string
  items: { id: string; name: string; quantity: number; price: number }[]
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [editingTracking, setEditingTracking] = useState<string | null>(null)
  const [trackingForm, setTrackingForm] = useState({ number: "", url: "" })
  const [savingId, setSavingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  async function fetchOrders(pageNum: number, query?: string) {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(pageNum) })
      if (query) params.set("q", query)
      const res = await fetch(`/api/admin/orders?${params}`)
      if (res.status === 401) {
        router.push("/auth/login")
        return
      }
      const data = await res.json()
      setOrders(data.orders)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch {
      console.error("Errore nel caricamento ordini")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders(page, debouncedQuery)
    // fetchOrders is intentionally excluded — adding it would cause an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedQuery])

  async function updateStatus(orderId: string, status: string) {
    setSavingId(orderId)
    try {
      const result = await updateOrder({ id: orderId, status })
      if (result.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status } : o))
        )
      }
    } finally {
      setSavingId(null)
    }
  }

  async function saveTracking(orderId: string) {
    setSavingId(orderId)
    try {
      const result = await updateOrder({
        id: orderId,
        trackingNumber: trackingForm.number || null,
        trackingUrl: trackingForm.url || null,
      })
      if (result.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, trackingNumber: trackingForm.number, trackingUrl: trackingForm.url }
              : o
          )
        )
        setEditingTracking(null)
        setTrackingForm({ number: "", url: "" })
      }
    } finally {
      setSavingId(null)
    }
  }

  function startEditTracking(order: Order) {
    setEditingTracking(order.id)
    setTrackingForm({
      number: order.trackingNumber || "",
      url: order.trackingUrl || "",
    })
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-zinc-900">Gestione Ordini</h1>
        <p className="mt-4 text-zinc-500">Caricamento ordini...</p>
      </div>
    )
  }

  async function handleExportCSV() {
    const result = await exportOrdersCSV()
    if (!result.success) return
    const blob = new Blob([result.data], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ordini-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Gestione Ordini</h1>
          <p className="mt-1 text-sm text-zinc-500">{total} ordini totali</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Esporta CSV
        </button>
      </div>

      <div className="mt-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca per numero fattura, email, nome..."
            className="w-full rounded-lg border border-zinc-300 py-2 pl-10 pr-4 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg px-3 py-2 text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-30"
          >
            &laquo; Precedente
          </button>
          <span className="text-zinc-500">
            Pagina {page} di {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg px-3 py-2 text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-30"
          >
            Successiva &raquo;
          </button>
        </div>
      )}

      <div className="mt-8 space-y-4">
        {orders.length === 0 ? (
          <p className="text-zinc-500">Nessun ordine ancora.</p>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="rounded-lg border border-zinc-200 bg-chalk p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-semibold text-zinc-900">
                      {order.invoiceNumber || `#${order.id.slice(0, 8)}`}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[order.status] || "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        order.paymentStatus === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.paymentStatus === "paid" ? "Pagato" : "In attesa"}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-zinc-500">
                    {order.user?.name || "Ospite"} — {order.user?.email || order.guestEmail}
                  </p>

                  <div className="mt-2 text-xs text-zinc-400">
                    {new Date(order.createdAt).toLocaleDateString("it-IT", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>

                  <ul className="mt-3 space-y-1">
                    {order.items.map((item) => (
                      <li key={item.id} className="text-sm text-zinc-600">
                        {item.name} x{item.quantity} — {formatPrice(item.price * item.quantity)}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-2 text-sm font-medium text-zinc-900">
                    Totale: {formatPrice(order.total)}
                  </div>

                  {order.trackingNumber && (
                    <div className="mt-2 text-sm text-zinc-600">
                      Tracking:{" "}
                      {order.trackingUrl ? (
                        <a
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:text-primary-hover"
                        >
                          {order.trackingNumber}
                        </a>
                      ) : (
                        <span className="font-medium">{order.trackingNumber}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <select
                    value={order.status}
                    onChange={(e) => {
                      const newStatus = e.target.value
                      if (newStatus === order.status) return
                      if (window.confirm(`Confermi il passaggio a "${STATUS_LABELS[newStatus] || newStatus}"?`)) {
                        updateStatus(order.id, newStatus)
                      }
                    }}
                    disabled={savingId === order.id}
                    className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 text-center"
                  >
                    Dettaglio
                  </Link>

                  {editingTracking === order.id ? (
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={trackingForm.number}
                        onChange={(e) =>
                          setTrackingForm({ ...trackingForm, number: e.target.value })
                        }
                        placeholder="Codice tracking"
                        className="w-48 rounded-md border border-zinc-300 px-3 py-1.5 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                      />
                      <input
                        type="text"
                        value={trackingForm.url}
                        onChange={(e) =>
                          setTrackingForm({ ...trackingForm, url: e.target.value })
                        }
                        placeholder="URL tracking (opzionale)"
                        className="w-48 rounded-md border border-zinc-300 px-3 py-1.5 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveTracking(order.id)}
                          disabled={savingId === order.id}
                          className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
                        >
                          Salva
                        </button>
                        <button
                          onClick={() => setEditingTracking(null)}
                          className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
                        >
                          Annulla
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditTracking(order)}
                      className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
                    >
                      {order.trackingNumber ? "Modifica tracking" : "Aggiungi tracking"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
