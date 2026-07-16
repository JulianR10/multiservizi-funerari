"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import {
  createShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
  toggleShippingMethodActive,
} from "@/app/actions/admin-shipping"
import { formatPrice } from "@/lib/format"

type ShippingMethod = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  estimatedDaysMin: number | null
  estimatedDaysMax: number | null
  active: boolean
}

type Form = {
  name: string
  description: string
  price: string
  estimatedDaysMin: string
  estimatedDaysMax: string
  active: boolean
}

const EMPTY: Form = {
  name: "",
  description: "",
  price: "0",
  estimatedDaysMin: "",
  estimatedDaysMax: "",
  active: true,
}

export function ShippingManager({ initial }: { initial: ShippingMethod[] }) {
  const [list, setList] = useState(initial)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<Form>(EMPTY)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function startAdd() {
    setForm(EMPTY)
    setAdding(true)
    setEditingId(null)
    setError(null)
  }

  function startEdit(m: ShippingMethod) {
    setForm({
      name: m.name,
      description: m.description || "",
      price: String(m.price),
      estimatedDaysMin: m.estimatedDaysMin != null ? String(m.estimatedDaysMin) : "",
      estimatedDaysMax: m.estimatedDaysMax != null ? String(m.estimatedDaysMax) : "",
      active: m.active,
    })
    setEditingId(m.id)
    setAdding(false)
    setError(null)
  }

  function cancel() {
    setAdding(false)
    setEditingId(null)
    setError(null)
  }

  function buildPayload() {
    return {
      name: form.name,
      description: form.description,
      price: Number(form.price) || 0,
      estimatedDaysMin: form.estimatedDaysMin ? Number(form.estimatedDaysMin) : undefined,
      estimatedDaysMax: form.estimatedDaysMax ? Number(form.estimatedDaysMax) : undefined,
      active: form.active,
    }
  }

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const payload = buildPayload()
      const result = editingId
        ? await updateShippingMethod(editingId, payload)
        : await createShippingMethod(payload)
      if (result.success) {
        toast.success(editingId ? "Metodo aggiornato" : "Metodo creato")
        cancel()
        window.location.reload()
      } else {
        setError(result.error || "Errore")
        toast.error(result.error || "Errore")
      }
    })
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Eliminare "${name}"? Operazione irreversibile.`)) return
    startTransition(async () => {
      const result = await deleteShippingMethod(id)
      if (result.success) {
        toast.success("Metodo eliminato")
        setList((prev) => prev.filter((m) => m.id !== id))
      } else {
        toast.error(result.error || "Errore")
      }
    })
  }

  function handleToggle(id: string, active: boolean) {
    startTransition(async () => {
      const result = await toggleShippingMethodActive(id, active)
      if (result.success) {
        setList((prev) => prev.map((m) => (m.id === id ? { ...m, active } : m)))
        toast.success(active ? "Metodo attivato" : "Metodo disattivato")
      } else {
        toast.error(result.error || "Errore")
      }
    })
  }

  return (
    <div className="mt-8">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {!adding && !editingId && (
        <>
          <button
            type="button"
            onClick={startAdd}
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            + Nuovo metodo
          </button>

          {list.length === 0 ? (
            <p className="mt-6 text-sm text-zinc-500">Nessun metodo di spedizione configurato.</p>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200">
              <table className="min-w-full divide-y divide-zinc-200">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">
                      Nome
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">
                      Prezzo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">
                      Giorni
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500">
                      Stato
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-zinc-500">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-chalk">
                  {list.map((m) => (
                    <tr key={m.id} className="hover:bg-zinc-50">
                      <td className="px-4 py-3 text-sm">
                        <p className="font-medium text-zinc-900">{m.name}</p>
                        {m.description && (
                          <p className="mt-0.5 text-xs text-zinc-500">{m.description}</p>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-900">
                        {formatPrice(m.price)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-600">
                        {m.estimatedDaysMin != null && m.estimatedDaysMax != null
                          ? `${m.estimatedDaysMin}–${m.estimatedDaysMax}`
                          : m.estimatedDaysMin != null
                            ? `${m.estimatedDaysMin}+`
                            : "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleToggle(m.id, !m.active)}
                          disabled={isPending}
                          className={`rounded-full px-2 py-0.5 text-xs font-medium transition ${
                            m.active
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : "bg-zinc-200 text-zinc-600 hover:bg-zinc-300"
                          }`}
                        >
                          {m.active ? "Attivo" : "Disattivato"}
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                        <button
                          type="button"
                          onClick={() => startEdit(m)}
                          disabled={isPending}
                          className="font-medium text-zinc-900 hover:text-zinc-600"
                        >
                          Modifica
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(m.id, m.name)}
                          disabled={isPending}
                          className="ml-3 font-medium text-red-600 hover:text-red-500"
                        >
                          Elimina
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {(adding || editingId) && (
        <ShippingForm
          form={form}
          setForm={setForm}
          onSubmit={handleSave}
          onCancel={cancel}
          isEditing={!!editingId}
          pending={isPending}
        />
      )}
    </div>
  )
}

function ShippingForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  isEditing,
  pending,
}: {
  form: Form
  setForm: (f: Form) => void
  onSubmit: () => void
  onCancel: () => void
  isEditing: boolean
  pending: boolean
}) {
  function update<K extends keyof Form>(key: K, value: Form[K]) {
    setForm({ ...form, [key]: value })
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-chalk p-6">
      <h2 className="text-sm font-semibold text-zinc-900">
        {isEditing ? "Modifica metodo" : "Nuovo metodo di spedizione"}
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-zinc-700">Nome *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
            maxLength={100}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-zinc-700">Descrizione</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            maxLength={500}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-700">
            Prezzo (centesimi) *
          </label>
          <input
            type="number"
            min={0}
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Es. 890 = €8.90
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-700">Giorni min</label>
            <input
              type="number"
              min={0}
              value={form.estimatedDaysMin}
              onChange={(e) => update("estimatedDaysMin", e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700">Giorni max</label>
            <input
              type="number"
              min={0}
              value={form.estimatedDaysMax}
              onChange={(e) => update("estimatedDaysMax", e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="inline-flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => update("active", e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
            />
            <span>Metodo attivo (mostrato al checkout)</span>
          </label>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Annulla
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={pending}
          className="rounded-full bg-zinc-900 px-6 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {pending ? "Salvataggio…" : isEditing ? "Salva" : "Crea metodo"}
        </button>
      </div>
    </div>
  )
}
