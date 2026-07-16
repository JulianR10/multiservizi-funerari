"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { formatPrice } from "@/lib/format"
import {
  createList,
  updateList,
  deleteList,
  duplicateList,
  updateItemQuantity,
  removeItemFromList,
  addListToCart,
} from "@/app/actions/customer-lists"

type ListItem = {
  id: string
  productId: string
  quantity: number
  name: string
  slug: string
  image: string
  price: number
  stock: number
  published: boolean
}

type List = {
  id: string
  name: string
  notes: string | null
  createdAt: string
  updatedAt: string
  items: ListItem[]
}

export function ListsClient({ initialLists }: { initialLists: List[] }) {
  const router = useRouter()
  const [lists, setLists] = useState(initialLists)
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [newName, setNewName] = useState("")
  const [newNotes, setNewNotes] = useState("")
  const [editName, setEditName] = useState("")
  const [editNotes, setEditNotes] = useState("")
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState<string | null>(null)

  function handleCreate() {
    if (!newName.trim()) {
      toast.error("Inserisci un nome")
      return
    }
    setLoading("create")
    startTransition(async () => {
      const result = await createList(newName, newNotes || undefined)
      if (result.success) {
        toast.success("Lista creata")
        setCreating(false)
        setNewName("")
        setNewNotes("")
        router.refresh()
      } else {
        toast.error(result.error || "Errore")
      }
      setLoading(null)
    })
  }

  function startEdit(list: List) {
    setEditingId(list.id)
    setEditName(list.name)
    setEditNotes(list.notes || "")
  }

  function handleUpdate(id: string) {
    if (!editName.trim()) {
      toast.error("Nome obbligatorio")
      return
    }
    setLoading(id)
    startTransition(async () => {
      const result = await updateList(id, { name: editName, notes: editNotes || "" })
      if (result.success) {
        toast.success("Lista aggiornata")
        setEditingId(null)
        router.refresh()
      } else {
        toast.error(result.error || "Errore")
      }
      setLoading(null)
    })
  }

  function handleDelete(list: List) {
    if (!confirm(`Eliminare "${list.name}"? Operazione irreversibile.`)) return
    setLoading(list.id)
    startTransition(async () => {
      const result = await deleteList(list.id)
      if (result.success) {
        toast.success("Lista eliminata")
        setLists((prev) => prev.filter((l) => l.id !== list.id))
      } else {
        toast.error(result.error || "Errore")
      }
      setLoading(null)
    })
  }

  function handleDuplicate(list: List) {
    setLoading(list.id)
    startTransition(async () => {
      const result = await duplicateList(list.id)
      if (result.success) {
        toast.success("Lista duplicata")
        router.refresh()
      } else {
        toast.error(result.error || "Errore")
      }
      setLoading(null)
    })
  }

  function handleAddToCart(list: List) {
    if (list.items.length === 0) {
      toast.error("Lista vuota")
      return
    }
    setLoading(list.id)
    startTransition(async () => {
      const result = await addListToCart(list.id)
      if (result.success) {
        toast.success(`${list.items.length} articol${list.items.length === 1 ? "o" : "i"} nel carrello`)
        router.push("/carrello")
      } else {
        toast.error(result.error || "Errore")
      }
      setLoading(null)
    })
  }

  function handleUpdateQty(itemId: string, quantity: number) {
    startTransition(async () => {
      await updateItemQuantity(itemId, quantity)
      router.refresh()
    })
  }

  function handleRemoveItem(itemId: string) {
    startTransition(async () => {
      await removeItemFromList(itemId)
      router.refresh()
    })
  }

  if (lists.length === 0 && !creating) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center">
        <p className="text-sm text-zinc-500">
          Non hai ancora creato nessuna lista della spesa.
        </p>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-medium text-chalk hover:bg-primary-hover"
        >
          + Crea la prima lista
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!creating && (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          + Nuova lista
        </button>
      )}

      {creating && (
        <div className="rounded-lg border border-zinc-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-zinc-900">Nuova lista</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-700">
                Nome *
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={80}
                placeholder="es. Ordine mensile"
                className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-700">
                Note (opzionale)
              </label>
              <textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                maxLength={500}
                rows={2}
                placeholder="Note interne per identificare la lista"
                className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setCreating(false)
                setNewName("")
                setNewNotes("")
              }}
              className="rounded-md border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Annulla
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={isPending && loading === "create"}
              className="rounded-full bg-primary px-5 py-1.5 text-sm font-semibold text-chalk hover:bg-primary-hover disabled:opacity-50"
            >
              {loading === "create" ? "Creazione…" : "Crea lista"}
            </button>
          </div>
        </div>
      )}

      {lists.map((list) => {
        const isExpanded = expandedId === list.id
        const isEditing = editingId === list.id
        const totalQty = list.items.reduce((acc, it) => acc + it.quantity, 0)
        const totalPrice = list.items.reduce((acc, it) => acc + it.price * it.quantity, 0)
        const unavailable = list.items.filter((it) => !it.published).length

        return (
          <div
            key={list.id}
            className="rounded-lg border border-zinc-200 bg-white"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 p-5">
              {isEditing ? (
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    maxLength={80}
                    className="block w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    maxLength={500}
                    rows={1}
                    placeholder="Note (opzionale)"
                    className="block w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              ) : (
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-zinc-900">{list.name}</h3>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {list.items.length}{" "}
                    {list.items.length === 1 ? "articolo" : "articoli"} ·{" "}
                    {totalQty} pezzi · {formatPrice(totalPrice)}
                    {list.notes && (
                      <span className="ml-2 italic">— {list.notes}</span>
                    )}
                  </p>
                  {unavailable > 0 && (
                    <p className="mt-1 text-[11px] text-amber-700">
                      ⚠ {unavailable} articol{unavailable === 1 ? "o non più" : "i non più"} disponibil{
                        unavailable === 1 ? "e" : "i"
                      }
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleUpdate(list.id)}
                      disabled={isPending}
                      className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-hover disabled:opacity-50"
                    >
                      Salva
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                    >
                      Annulla
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleAddToCart(list)}
                      disabled={isPending || list.items.length === 0}
                      className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-chalk hover:bg-primary-hover disabled:opacity-50"
                    >
                      {loading === list.id ? "…" : "Aggiungi al carrello"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : list.id)}
                      className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                    >
                      {isExpanded ? "Nascondi" : "Modifica"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicate(list)}
                      disabled={isPending}
                      className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                    >
                      Duplica
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(list)}
                      disabled={isPending}
                      className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                    >
                      Rinomina
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(list)}
                      disabled={isPending}
                      className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      Elimina
                    </button>
                  </>
                )}
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-zinc-200 bg-chalk/40 p-5">
                {list.items.length === 0 ? (
                  <p className="text-sm text-zinc-500">Lista vuota.</p>
                ) : (
                  <ul className="divide-y divide-zinc-100">
                    {list.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex flex-wrap items-center gap-3 py-3"
                      >
                        <Link
                          href={`/prodotti/${item.slug}`}
                          className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-chalk"
                        >
                          {item.image && (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          )}
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/prodotti/${item.slug}`}
                            className="line-clamp-1 text-sm font-medium text-zinc-900 hover:text-primary"
                          >
                            {item.name}
                          </Link>
                          <p className="text-xs text-zinc-500">
                            {formatPrice(item.price)} · totale {formatPrice(item.price * item.quantity)}
                            {!item.published && (
                              <span className="ml-2 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                                non disponibile
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                            disabled={isPending}
                            className="h-7 w-7 rounded-md border border-zinc-300 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-zinc-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                            disabled={isPending || item.quantity >= 999}
                            className="h-7 w-7 rounded-md border border-zinc-300 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isPending}
                          className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          aria-label={`Rimuovi ${item.name}`}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
