"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import {
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/app/actions/customer-addresses"

type Address = {
  id: string
  label: string | null
  firstName: string
  lastName: string
  company: string | null
  address: string
  address2: string | null
  city: string
  province: string | null
  postalCode: string
  country: string
  phone: string | null
  isDefault: boolean
}

type FormState = {
  label: string
  firstName: string
  lastName: string
  company: string
  address: string
  address2: string
  city: string
  province: string
  postalCode: string
  country: string
  phone: string
  isDefault: boolean
}

const EMPTY: FormState = {
  label: "",
  firstName: "",
  lastName: "",
  company: "",
  address: "",
  address2: "",
  city: "",
  province: "",
  postalCode: "",
  country: "IT",
  phone: "",
  isDefault: false,
}

export function AddressesClient({ initialAddresses }: { initialAddresses: Address[] }) {
  const [list, setList] = useState(initialAddresses)
  const [editing, setEditing] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function startAdd() {
    setForm({ ...EMPTY, isDefault: list.length === 0 })
    setAdding(true)
    setEditing(null)
    setError(null)
  }

  function startEdit(addr: Address) {
    setForm({
      label: addr.label || "",
      firstName: addr.firstName,
      lastName: addr.lastName,
      company: addr.company || "",
      address: addr.address,
      address2: addr.address2 || "",
      city: addr.city,
      province: addr.province || "",
      postalCode: addr.postalCode,
      country: addr.country,
      phone: addr.phone || "",
      isDefault: addr.isDefault,
    })
    setEditing(addr.id)
    setAdding(false)
    setError(null)
  }

  function cancel() {
    setAdding(false)
    setEditing(null)
    setError(null)
  }

  async function handleSave() {
    setError(null)
    startTransition(async () => {
      const payload = {
        label: form.label,
        firstName: form.firstName,
        lastName: form.lastName,
        company: form.company,
        address: form.address,
        address2: form.address2,
        city: form.city,
        province: form.province,
        postalCode: form.postalCode,
        country: form.country,
        phone: form.phone,
        isDefault: form.isDefault,
      }
      const result = editing
        ? await updateAddress(editing, payload)
        : await createAddress(payload)

      if (result.success) {
        toast.success(editing ? "Indirizzo aggiornato" : "Indirizzo aggiunto")
        cancel()
        window.location.reload()
      } else {
        setError(result.error || "Errore")
        toast.error(result.error || "Errore")
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm("Eliminare questo indirizzo?")) return
    startTransition(async () => {
      const result = await deleteAddress(id)
      if (result.success) {
        toast.success("Indirizzo eliminato")
        setList((prev) => prev.filter((a) => a.id !== id))
      } else {
        toast.error(result.error || "Errore")
      }
    })
  }

  function handleSetDefault(id: string) {
    startTransition(async () => {
      const result = await setDefaultAddress(id)
      if (result.success) {
        toast.success("Indirizzo predefinito aggiornato")
        window.location.reload()
      } else {
        toast.error(result.error || "Errore")
      }
    })
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {list.length === 0 && !adding && (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center">
          <p className="text-sm text-zinc-500">
            Non hai ancora salvato nessun indirizzo.
          </p>
          <button
            type="button"
            onClick={startAdd}
            className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-medium text-chalk hover:bg-primary-hover"
          >
            Aggiungi il primo indirizzo
          </button>
        </div>
      )}

      {list.length > 0 && !adding && !editing && (
        <div className="space-y-3">
          {list.map((addr) => (
            <AddressCard
              key={addr.id}
              address={addr}
              onEdit={() => startEdit(addr)}
              onDelete={() => handleDelete(addr.id)}
              onSetDefault={() => handleSetDefault(addr.id)}
              pending={isPending}
            />
          ))}
          <button
            type="button"
            onClick={startAdd}
            className="inline-flex items-center gap-1 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            + Aggiungi un altro indirizzo
          </button>
        </div>
      )}

      {(adding || editing) && (
        <AddressForm
          form={form}
          setForm={setForm}
          onSubmit={handleSave}
          onCancel={cancel}
          isEditing={!!editing}
          pending={isPending}
        />
      )}
    </div>
  )
}

function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  pending,
}: {
  address: Address
  onEdit: () => void
  onDelete: () => void
  onSetDefault: () => void
  pending: boolean
}) {
  return (
    <div
      className={`rounded-lg border bg-white p-5 ${
        address.isDefault ? "border-primary/40 ring-1 ring-primary/20" : "border-zinc-200"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-zinc-900">
              {address.label || `${address.firstName} ${address.lastName}`}
            </p>
            {address.isDefault && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                Predefinito
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-zinc-700">
            {address.firstName} {address.lastName}
            {address.company && <span className="text-zinc-500"> · {address.company}</span>}
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            {address.address}
            {address.address2 && <>, {address.address2}</>}
            <br />
            {address.postalCode} {address.city}
            {address.province && ` (${address.province})`}, {address.country}
          </p>
          {address.phone && <p className="mt-1 text-xs text-zinc-500">Tel: {address.phone}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!address.isDefault && (
            <button
              type="button"
              onClick={onSetDefault}
              disabled={pending}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              Rendi predefinito
            </button>
          )}
          <button
            type="button"
            onClick={onEdit}
            disabled={pending}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            Modifica
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            Elimina
          </button>
        </div>
      </div>
    </div>
  )
}

function AddressForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  isEditing,
  pending,
}: {
  form: FormState
  setForm: (f: FormState) => void
  onSubmit: () => void
  onCancel: () => void
  isEditing: boolean
  pending: boolean
}) {
  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm({ ...form, [key]: value })
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6">
      <h3 className="text-sm font-semibold text-zinc-900">
        {isEditing ? "Modifica indirizzo" : "Nuovo indirizzo"}
      </h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field
          label="Etichetta (opzionale)"
          value={form.label}
          onChange={(v) => update("label", v)}
          placeholder="es. Sede principale"
        />
        <Field
          label="Telefono"
          value={form.phone}
          onChange={(v) => update("phone", v)}
          type="tel"
        />
        <Field
          label="Nome *"
          value={form.firstName}
          onChange={(v) => update("firstName", v)}
          required
        />
        <Field
          label="Cognome *"
          value={form.lastName}
          onChange={(v) => update("lastName", v)}
          required
        />
        <div className="sm:col-span-2">
          <Field
            label="Azienda (opzionale)"
            value={form.company}
            onChange={(v) => update("company", v)}
          />
        </div>
        <div className="sm:col-span-2">
          <Field
            label="Indirizzo *"
            value={form.address}
            onChange={(v) => update("address", v)}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <Field
            label="Indirizzo 2 (opzionale)"
            value={form.address2}
            onChange={(v) => update("address2", v)}
          />
        </div>
        <Field
          label="Città *"
          value={form.city}
          onChange={(v) => update("city", v)}
          required
        />
        <Field
          label="Provincia"
          value={form.province}
          onChange={(v) => update("province", v.toUpperCase().slice(0, 2))}
          maxLength={2}
          placeholder="CZ"
        />
        <Field
          label="CAP *"
          value={form.postalCode}
          onChange={(v) => update("postalCode", v.replace(/[^0-9]/g, "").slice(0, 5))}
          required
          maxLength={5}
          pattern="[0-9]{5}"
        />
        <Field
          label="Paese"
          value={form.country}
          onChange={(v) => update("country", v.toUpperCase().slice(0, 2))}
          maxLength={2}
        />
        <div className="sm:col-span-2">
          <label className="inline-flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => update("isDefault", e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-primary focus:ring-primary"
            />
            <span>Imposta come indirizzo predefinito</span>
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
          className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-chalk hover:bg-primary-hover disabled:opacity-50"
        >
          {pending ? "Salvataggio…" : isEditing ? "Salva modifiche" : "Aggiungi indirizzo"}
        </button>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  maxLength,
  pattern,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
  maxLength?: number
  pattern?: string
  placeholder?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        maxLength={maxLength}
        pattern={pattern}
        placeholder={placeholder}
        className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  )
}
