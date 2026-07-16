"use client"

import { useRouter } from "next/navigation"
import { deleteCategory } from "@/app/actions/admin-categories"

type Props = {
  categoryId: string
  categoryName: string
  hasProducts: boolean
  hasChildren: boolean
}

export function DeleteCategoryButton({ categoryId, categoryName, hasProducts, hasChildren }: Props) {
  const router = useRouter()

  async function handleDelete() {
    if (hasProducts || hasChildren) {
      const reason = hasProducts
        ? "Sono presenti prodotti associati."
        : "Sono presenti sottocategorie."
      alert(`Impossibile eliminare "${categoryName}". ${reason}`)
      return
    }

    const confirmed = window.confirm(
      `Sei sicuro di voler eliminare "${categoryName}"? Questa azione non può essere annullata.`
    )
    if (!confirmed) return

    const result = await deleteCategory(categoryId)
    if (result.success) {
      router.refresh()
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="ml-2 font-medium text-red-600 hover:text-red-500"
    >
      Elimina
    </button>
  )
}
