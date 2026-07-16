"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createListFromOrder } from "@/app/actions/customer-lists"

export function SaveAsListButton({
  orderId,
  defaultName,
}: {
  orderId: string
  defaultName?: string
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(defaultName || "")
  const [isPending, startTransition] = useTransition()

  function save() {
    startTransition(async () => {
      const result = await createListFromOrder(orderId, name || undefined)
      if (result.success) {
        toast.success("Lista creata")
        setEditing(false)
        router.push("/account/lists")
      } else {
        toast.error(result.error || "Errore")
      }
    })
  }

  if (editing) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-3 text-sm">
        <label className="block text-xs font-medium text-zinc-700">
          Nome lista
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          placeholder="es. Ordine mensile"
          className="mt-1 block w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={save}
            disabled={isPending}
            className="flex-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-chalk hover:bg-primary-hover disabled:opacity-50"
          >
            {isPending ? "Salvataggio…" : "Salva"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Annulla
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="flex w-full items-center justify-center gap-2 rounded-full border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
      Salva come lista
    </button>
  )
}
