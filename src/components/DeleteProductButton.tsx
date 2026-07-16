"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteProduct } from "@/app/actions/admin"

type Props = {
  productId: string
  productName: string
}

export function DeleteProductButton({ productId, productName }: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    const confirmed = window.confirm(
      `Sei sicuro di voler eliminare "${productName}"? Questa azione non può essere annullata.`
    )
    if (!confirmed) return

    setError(null)
    const result = await deleteProduct(productId)
    if (result.success) {
      router.refresh()
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="inline">
      <button
        onClick={handleDelete}
        className="ml-2 font-medium text-red-600 hover:text-red-500"
      >
        Elimina
      </button>
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}
