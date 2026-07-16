"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { saveSettings } from "@/app/actions/admin-settings"

type Initial = {
  freeShippingThreshold: string
  defaultTaxRate: string
  adminNotifyEmail: string
  invoicePrefix: string
  orderEmailBcc: string
  lowStockThreshold: string
}

export function SettingsForm({ initial }: { initial: Initial }) {
  const [isPending, startTransition] = useTransition()
  const [values, setValues] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function update<K extends keyof Initial>(key: K, value: Initial[K]) {
    setValues({ ...values, [key]: value })
  }

  function handleSubmit(formData: FormData) {
    setError(null)
    setSuccess(false)
    startTransition(async () => {
      const result = await saveSettings({
        free_shipping_threshold: values.freeShippingThreshold,
        default_tax_rate: values.defaultTaxRate,
        admin_notify_email: values.adminNotifyEmail,
        invoice_prefix: values.invoicePrefix,
        order_email_bcc: values.orderEmailBcc,
        low_stock_threshold: values.lowStockThreshold,
      })
      if (result.success) {
        setSuccess(true)
        toast.success("Impostazioni salvate")
      } else {
        setError(result.error || "Errore")
        toast.error(result.error || "Errore")
      }
    })
  }

  return (
    <form action={handleSubmit} className="mt-8 space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Impostazioni salvate correttamente.
        </div>
      )}

      <section className="rounded-lg border border-zinc-200 bg-chalk p-6">
        <h2 className="text-sm font-semibold text-zinc-900">Catalogo e prezzi</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-zinc-700">
              Soglia spedizione gratuita (centesimi)
            </label>
            <input
              type="number"
              min={0}
              value={values.freeShippingThreshold}
              onChange={(e) => update("freeShippingThreshold", e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Es. 15000 = €150. Sotto questa soglia si applicano i metodi di spedizione.
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700">Aliquota IVA (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={values.defaultTaxRate}
              onChange={(e) => update("defaultTaxRate", e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700">
              Prefisso fattura
            </label>
            <input
              type="text"
              maxLength={20}
              value={values.invoicePrefix}
              onChange={(e) => update("invoicePrefix", e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700">
              Soglia stock basso (per notifiche)
            </label>
            <input
              type="number"
              min={0}
              value={values.lowStockThreshold}
              onChange={(e) => update("lowStockThreshold", e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-chalk p-6">
        <h2 className="text-sm font-semibold text-zinc-900">Notifiche email</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Indirizzi che ricevono le email generate dal sistema.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-zinc-700">
              Email notifica nuovi ordini
            </label>
            <input
              type="email"
              value={values.adminNotifyEmail}
              onChange={(e) => update("adminNotifyEmail", e.target.value)}
              placeholder="amministrazione@multiservizifunerarisrl.com"
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-zinc-700">BCC email ordini</label>
            <input
              type="email"
              value={values.orderEmailBcc}
              onChange={(e) => update("orderEmailBcc", e.target.value)}
              placeholder="opzionale"
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>
        </div>
      </section>

      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {isPending ? "Salvataggio…" : "Salva impostazioni"}
        </button>
      </div>
    </form>
  )
}
