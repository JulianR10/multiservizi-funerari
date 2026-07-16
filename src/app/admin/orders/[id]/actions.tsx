"use client"

import { useState } from "react"
import { STATUS_OPTIONS } from "@/lib/order-status"
import { updateOrder, refundOrder } from "@/app/actions/admin"
import { formatPrice } from "@/lib/format"

type Props = {
  orderId: string
  currentStatus: string
  trackingNumber: string | null
  trackingUrl: string | null
  paymentStatus: string
  total: number
  invoiceNumber: string | null
}

export function OrderActions({
  orderId,
  currentStatus,
  trackingNumber,
  trackingUrl,
  paymentStatus,
  total,
  invoiceNumber,
}: Props) {
  const [status, setStatus] = useState(currentStatus)
  const [showTracking, setShowTracking] = useState(false)
  const [trackNum, setTrackNum] = useState(trackingNumber || "")
  const [trackUrl, setTrackUrl] = useState(trackingUrl || "")
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showRefundConfirm, setShowRefundConfirm] = useState(false)
  const [refundError, setRefundError] = useState<string | null>(null)

  async function updateStatus(newStatus: string) {
    setSaving(true)
    setSuccess(false)
    try {
      const result = await updateOrder({ id: orderId, status: newStatus })
      if (result.success) {
        setStatus(newStatus)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2000)
      }
    } finally {
      setSaving(false)
    }
  }

  async function saveTracking() {
    setSaving(true)
    setSuccess(false)
    try {
      const result = await updateOrder({
        id: orderId,
        trackingNumber: trackNum || null,
        trackingUrl: trackUrl || null,
      })
      if (result.success) {
        setShowTracking(false)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2000)
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleRefund() {
    setSaving(true)
    setRefundError(null)
    try {
      const result = await refundOrder(orderId)
      if (result.success) {
        setShowRefundConfirm(false)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setRefundError(result.error)
      }
    } catch {
      setRefundError("Errore durante il rimborso")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-6 rounded-lg border border-zinc-200 bg-chalk p-6">
      <div className="flex flex-wrap items-center gap-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700">Stato ordine</label>
          <div className="mt-1 flex items-center gap-3">
            <select
              value={status}
              onChange={(e) => {
                const newStatus = e.target.value
                if (newStatus === status) return
                if (window.confirm(`Confermi il passaggio a "${STATUS_OPTIONS.find(o => o.value === newStatus)?.label || newStatus}"?`)) {
                  updateStatus(newStatus)
                }
              }}
              disabled={saving}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {saving && <span className="text-xs text-zinc-400">Salvataggio...</span>}
          </div>
        </div>

        <div className="h-8 w-px bg-zinc-200" />

        <div>
          <label className="block text-sm font-medium text-zinc-700">Tracking</label>
          {showTracking ? (
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={trackNum}
                onChange={(e) => setTrackNum(e.target.value)}
                placeholder="Codice tracking"
                className="w-44 rounded-md border border-zinc-300 px-3 py-1.5 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
              <input
                type="text"
                value={trackUrl}
                onChange={(e) => setTrackUrl(e.target.value)}
                placeholder="URL tracking (opzionale)"
                className="w-44 rounded-md border border-zinc-300 px-3 py-1.5 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
              <button
                onClick={saveTracking}
                disabled={saving}
                className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
              >
                Salva
              </button>
              <button
                onClick={() => {
                  setShowTracking(false)
                  setTrackNum(trackingNumber || "")
                  setTrackUrl(trackingUrl || "")
                }}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
              >
                Annulla
              </button>
            </div>
          ) : (
            <div className="mt-1 flex items-center gap-3">
              {trackingNumber ? (
                <div className="flex items-center gap-2">
                  {trackingUrl ? (
                    <a
                      href={trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary hover:text-primary-hover"
                    >
                      {trackingNumber}
                    </a>
                  ) : (
                    <span className="text-sm text-zinc-900">{trackingNumber}</span>
                  )}
                  <button
                    onClick={() => setShowTracking(true)}
                    className="text-xs text-zinc-500 hover:text-zinc-900 underline"
                  >
                    Modifica
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowTracking(true)}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
                >
                  Aggiungi tracking
                </button>
              )}
            </div>
          )}
        </div>

        {paymentStatus === "paid" && (
          <>
            <div className="h-8 w-px bg-zinc-200" />
            <div>
              <label className="block text-sm font-medium text-zinc-700">Pagamento</label>
              <div className="mt-1 flex items-center gap-2">
                {invoiceNumber && (
                  <a
                    href={`/api/orders/${orderId}/invoice`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
                  >
                    Scarica fattura
                  </a>
                )}
                {currentStatus !== "pending" && currentStatus !== "cancelled" && (
                  <a
                    href={`/api/admin/orders/${orderId}/ddt`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
                  >
                    Scarica DDT
                  </a>
                )}
                {showRefundConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-600">
                      Rimborsare {formatPrice(total)}?
                    </span>
                    <button
                      onClick={handleRefund}
                      disabled={saving}
                      className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {saving ? "Rimborso..." : "Conferma"}
                    </button>
                    <button
                      onClick={() => {
                        setShowRefundConfirm(false)
                        setRefundError(null)
                      }}
                      className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
                    >
                      Annulla
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowRefundConfirm(true)}
                    className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Rimborsa ordine
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {refundError && (
        <p className="mt-3 text-sm text-red-600">Errore: {refundError}</p>
      )}

      {success && (
        <p className="mt-3 text-sm text-green-700">✓ Salvataggio completato.</p>
      )}
    </div>
  )
}
