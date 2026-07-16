"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { reorderFromOrder } from "@/app/actions/customer-orders"
import { toast } from "sonner"

export function ReorderButton({
  items,
}: {
  items: { productId: string; quantity: number }[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const result = await reorderFromOrder(items)
      if (result.success) {
        toast.success("Articoli aggiunti al carrello")
        router.push("/carrello")
        router.refresh()
      } else {
        toast.error(result.error || "Impossibile riordinare")
      }
    } catch {
      toast.error("Errore durante il riordino")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => startTransition(handleClick)}
      disabled={loading || isPending}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-chalk transition hover:bg-primary-hover disabled:opacity-50"
    >
      {loading || isPending ? "Aggiungo al carrello…" : "Riordina questi articoli"}
    </button>
  )
}
