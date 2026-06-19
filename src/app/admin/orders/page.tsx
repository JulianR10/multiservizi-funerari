"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatPrice } from "@/lib/format"
import { STATUS_LABELS, STATUS_COLORS, STATUS_OPTIONS } from "@/lib/order-status"
import { updateOrder } from "@/app/actions/admin"

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
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const [editingTracking, setEditingTracking] = useState<string | null>(null)
  const [trackingForm, setTrackingForm] = useState({ number: "", url: "" })
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/orders")
      if (res.status === 401) {
        router.push("/auth/login")
        return
      }
      const data = await res.json()
      setOrders(data)
    } catch {
      console.error("Errore nel caricamento ordini")
    } finally {
      setLoading(false)
    }
  }

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

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-zinc-900">Gestione Ordini</h1>
      <p className="mt-1 text-sm text-zinc-500">{orders.length} ordini totali</p>

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
                    onChange={(e) => updateStatus(order.id, e.target.value)}
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
