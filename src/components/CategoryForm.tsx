"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { upsertCategory } from "@/app/actions/admin-categories"

type CategoryOption = { id: string; name: string }
type CategoryData = {
  id: string
  name: string
  slug: string
  image: string | null
  parentId: string | null
}

export function CategoryForm({
  category,
  categories,
}: {
  category?: CategoryData
  categories: CategoryOption[]
}) {
  const router = useRouter()
  const isEdit = !!category
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: category?.name ?? "",
    image: category?.image ?? "",
    parentId: category?.parentId ?? "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const result = await upsertCategory({
        ...(isEdit ? { id: category.id } : {}),
        name: form.name,
        image: form.image || null,
        parentId: form.parentId || null,
      })

      if (!result.success) {
        setError(result.error || "Errore durante il salvataggio")
        setSaving(false)
        return
      }

      router.push("/admin/categories")
      router.refresh()
    } catch {
      setError("Errore di connessione")
      setSaving(false)
    }
  }

  const availableParents = categories.filter((c) => c.id !== category?.id)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-700">
          Nome categoria
        </label>
        <input
          id="name"
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
        />
      </div>

      {isEdit && (
        <div>
          <label className="block text-sm font-medium text-zinc-700">Slug</label>
          <p className="mt-1 text-sm text-zinc-400">{category.slug}</p>
        </div>
      )}

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-zinc-700">
          URL immagine (opzionale)
        </label>
        <input
          id="image"
          type="text"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
          placeholder="https://esempio.com/categoria.jpg"
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
        />
      </div>

      <div>
        <label htmlFor="parentId" className="block text-sm font-medium text-zinc-700">
          Categoria padre (opzionale)
        </label>
        <select
          id="parentId"
          value={form.parentId}
          onChange={(e) => setForm({ ...form, parentId: e.target.value })}
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
        >
          <option value="">Nessuna (categoria principale)</option>
          {availableParents.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {saving ? "Salvataggio..." : isEdit ? "Salva modifiche" : "Crea categoria"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/categories")}
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          Annulla
        </button>
      </div>
    </form>
  )
}
