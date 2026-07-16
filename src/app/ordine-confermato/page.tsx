"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ClearCartOnSuccess } from "@/components/ClearCartOnSuccess"
import { CheckmarkAnimation } from "@/components/CheckmarkAnimation"
import { formatPrice } from "@/lib/format"

type LineItem = {
  name: string
  quantity: number
  total: number
}

type SessionData = {
  id: string
  paymentIntentId: string | null
  customerEmail: string | null
  total: number
  subtotal: number
  lineItems: LineItem[]
  shipping: { name: string | null; address: { line1: string; line2: string | null; city: string; postal_code: string; country: string } } | null
  paymentStatus: string
  estimatedDelivery: string | null
}

export default function OrdineConfermatoPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!sessionId) { setLoading(false); return }

    fetch(`/api/stripe/session?session_id=${sessionId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Errore nel caricamento")
        return res.json()
      })
      .then((data) => { setSession(data); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [sessionId])

  const orderRef = session?.paymentIntentId
    ? session.paymentIntentId.replace("pi_", "PI-").slice(0, 12).toUpperCase()
    : sessionId
      ? sessionId.replace("cs_", "ORD-").slice(0, 12).toUpperCase()
      : null

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <ClearCartOnSuccess />

      <CheckmarkAnimation />

      <h1 className="mt-6 font-heading text-3xl font-bold text-zinc-900">Ordine confermato!</h1>
      <p className="mt-3 text-zinc-600">
        Grazie per il tuo ordine. Riceverai una email di conferma con tutti i dettagli.
      </p>

      {orderRef && (
        <p className="mt-2 text-sm text-zinc-500">
          Riferimento: <span className="font-mono font-medium text-zinc-700">{orderRef}</span>
        </p>
      )}

      {loading && (
        <div className="mx-auto mt-8 h-48 w-full max-w-sm animate-pulse rounded-lg bg-zinc-100" />
      )}

      {session && !loading && (
        <div className="mt-8 rounded-lg border border-zinc-200 bg-chalk p-6 text-left">
          <h2 className="font-heading text-base font-semibold text-zinc-900">Riepilogo ordine</h2>
          <ul className="mt-3 divide-y divide-zinc-200 text-sm">
            {session.lineItems.map((item, i) => (
              <li key={i} className="flex justify-between py-2">
                <span className="text-zinc-700">
                  {item.name} <span className="text-zinc-400">x{item.quantity}</span>
                </span>
                <span className="font-medium text-zinc-900">{formatPrice(item.total)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 border-t border-zinc-200 pt-3 text-sm">
            <div className="flex justify-between font-semibold text-zinc-900">
              <span>Totale pagato</span>
              <span>{formatPrice(session.total)}</span>
            </div>
          </div>

          {session.estimatedDelivery && (
            <div className="mt-4 rounded-lg bg-primary/5 p-4 text-sm">
              <p className="font-medium text-primary">Consegna prevista</p>
              <p className="mt-1 text-zinc-600">
                {new Date(session.estimatedDelivery).toLocaleDateString("it-IT", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          )}

          {session.customerEmail && (
            <p className="mt-3 text-xs text-zinc-400">
              Email: {session.customerEmail}
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-700">
            Non è stato possibile caricare i dettagli dell&apos;ordine.
          </p>
          <p className="mt-2 text-xs text-red-500">
            Se hai ricevuto la conferma via email, il tuo ordine è stato elaborato correttamente.
          </p>
          <Link
            href="/track"
            className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Monitora il tuo ordine
          </Link>
        </div>
      )}

      {!sessionId && !loading && !error && (
        <p className="mt-6 text-sm text-zinc-400">
          Riceverai una email di conferma con il riepilogo del tuo ordine. Puoi anche{" "}
          <Link href="/track" className="text-primary underline hover:text-primary-hover">
            monitorare il tuo ordine
          </Link>
          . Se non ricevi l&apos;email entro pochi minuti,{" "}
          <a href="mailto:info@petrungaro-multiservizi.it" className="text-primary underline hover:text-primary-hover">
            contattaci
          </a>
          .
        </p>
      )}

      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          onClick={() => window.print()}
          className="rounded-full border border-zinc-300 px-6 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          Stampa ricevuta
        </button>
        {session?.customerEmail && (
          <Link
            href={`/track?email=${encodeURIComponent(session.customerEmail)}`}
            className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Monitora il tuo ordine
          </Link>
        )}
        <Link href="/" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 underline">
          Torna alla home
        </Link>
      </div>
    </div>
  )
}
