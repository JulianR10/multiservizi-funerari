"use client"

import { useState, FormEvent } from "react"
import { formatPrice } from "@/lib/format"
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/order-status"
import { OrderTimeline } from "@/components/OrderTimeline"

type OrderItem = {
  id: string
  name: string
  quantity: number
  price: number
}

type Order = {
  id: string
  invoiceNumber: string | null
  total: number
  subtotal: number
  tax: number
  status: string
  paymentStatus: string
  createdAt: string
  items: OrderItem[]
  trackingNumber: string | null
  trackingUrl: string | null
  estimatedDelivery: string | null
}

export function TrackForm({ initialEmail }: { initialEmail: string }) {
  const [email, setEmail] = useState(initialEmail)
  const [orderNumber, setOrderNumber] = useState("")
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e: FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)
    setOrders(null)
    setSearched(false)

    try {
      const params = new URLSearchParams({ email: trimmed })
      if (orderNumber.trim()) {
        params.set("orderNumber", orderNumber.trim())
      }
      const res = await fetch(`/api/orders/by-email?${params}`)
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Errore durante la ricerca")
        return
      }
      const data: Order[] = await res.json()
      setOrders(data)
    } catch {
      setError("Errore di connessione. Riprova.")
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tua@email.com"
          required
          className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
        />
        <input
          type="text"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="Nº ordine (opzionale)"
          className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 sm:w-44"
        />
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="self-center cursor-pointer rounded-full bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50 sm:self-auto"
        >
          {loading ? "Ricerca in corso..." : "Cerca"}
        </button>
      </form>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      {searched && !loading && !error && orders && orders.length === 0 && (
        <div className="mt-8 rounded-lg border border-zinc-200 bg-chalk p-8 text-center">
          <p className="text-zinc-500">Nessun ordine trovato per questa email.</p>
          <p className="mt-1 text-sm text-zinc-400">
            Verifica che l&apos;email corrisponda a quella usata al momento dell&apos;acquisto.
          </p>
        </div>
      )}

      {orders && orders.length > 0 && (
        <div className="mt-8 space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border border-zinc-200 bg-chalk p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
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
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">
                    {new Date(order.createdAt).toLocaleDateString("it-IT", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className="text-lg font-bold text-primary">
                  {formatPrice(order.total)}
                </span>
              </div>

              <OrderTimeline currentStatus={order.status} />

              <ul className="mt-4 divide-y divide-zinc-100">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between py-2 text-sm">
                    <span className="text-zinc-900">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="text-zinc-600">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex justify-between border-t border-zinc-100 pt-3 text-sm">
                <span className="text-zinc-500">Subtotale</span>
                <span className="text-zinc-900">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">IVA 22%</span>
                <span className="text-zinc-900">{formatPrice(order.tax)}</span>
              </div>

              {order.estimatedDelivery && (
                <div className="mt-4 rounded-lg bg-primary/5 p-3 text-sm">
                  <span className="font-medium text-primary">Consegna prevista: </span>
                  <span className="text-zinc-600">
                    {new Date(order.estimatedDelivery).toLocaleDateString("it-IT", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}

              {order.trackingNumber && (
                <div className="mt-4 rounded-md bg-blue-50 p-3 text-sm">
                  <span className="font-medium text-blue-700">Tracking: </span>
                  {order.trackingUrl ? (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {order.trackingNumber}
                    </a>
                  ) : (
                    <span className="text-blue-700">{order.trackingNumber}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
