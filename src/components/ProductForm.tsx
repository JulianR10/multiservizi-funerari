"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { upsertProduct } from "@/app/actions/admin"
import { ImageUploader } from "@/components/ImageUploader"

type Category = { id: string; name: string }
type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  comparePrice: number | null
  images: string[]
  categoryId: string
  stock: number
  published: boolean
  featured: boolean
}

export function ProductForm({ categories, product }: { categories: Category[]; product?: Product }) {
  const router = useRouter()
  const isEdit = !!product
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product ? String(product.price) : "",
    comparePrice: product?.comparePrice ? String(product.comparePrice) : "",
    categoryId: product?.categoryId ?? "",
    stock: product ? String(product.stock) : "0",
    published: product?.published ?? false,
    featured: product?.featured ?? false,
  })
  const [images, setImages] = useState<string[]>(product?.images ?? [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const price = parseInt(form.price)
    if (isNaN(price) || price < 0) {
      setError("Prezzo non valido")
      setSaving(false)
      return
    }

    try {
      const result = await upsertProduct({
        ...(isEdit ? { id: product!.id } : {}),
        name: form.name,
        description: form.description,
        price,
        comparePrice: form.comparePrice ? parseInt(form.comparePrice) : null,
        images,
        categoryId: form.categoryId,
        stock: parseInt(form.stock) || 0,
        published: form.published,
        featured: form.featured,
      })

      if (!result.success) {
        setError(result.error || "Errore durante il salvataggio")
        setSaving(false)
        return
      }

      router.push("/admin/products")
      router.refresh()
    } catch {
      setError("Errore di connessione")
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-700">
          Nome prodotto
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

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-zinc-700">
            Prezzo (in centesimi)
          </label>
          <input
            id="price"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
            min={0}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
          <p className="mt-1 text-xs text-zinc-400">
            Esempio: 1990 = €19.90
          </p>
        </div>

        <div>
          <label htmlFor="comparePrice" className="block text-sm font-medium text-zinc-700">
            Prezzo originale (opzionale)
          </label>
          <input
            id="comparePrice"
            type="number"
            value={form.comparePrice}
            onChange={(e) => setForm({ ...form, comparePrice: e.target.value })}
            min={0}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-zinc-700">
          Categoria
        </label>
        <select
          id="category"
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          required
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
        >
          <option value="">Seleziona categoria</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-zinc-700">
          Descrizione
        </label>
        <textarea
          id="description"
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700">Immagini</label>
        <p className="mt-0.5 text-xs text-zinc-500">
          Trascina i file o clicca per caricarli. La prima sarà l&apos;immagine principale.
        </p>
        <div className="mt-2">
          <ImageUploader value={images} onChange={setImages} maxFiles={8} />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-zinc-700">
            Stock
          </label>
          <input
            id="stock"
            type="number"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            min={0}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
            className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
          />
          <span className="text-sm text-zinc-700">Pubblicato</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
          />
          <span className="text-sm text-zinc-700">In evidenza</span>
        </label>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {saving ? "Salvataggio..." : isEdit ? "Salva modifiche" : "Crea prodotto"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          Annulla
        </button>
      </div>
    </form>
  )
}
