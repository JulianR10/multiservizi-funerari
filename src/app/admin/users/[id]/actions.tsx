"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function UserActions({
  userId,
  currentStatus,
}: {
  userId: string
  currentStatus: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState<string | null>(null)

  function changeStatus(action: "approve" | "reject") {
    if (currentStatus === "REJECTED" && action === "reject") return
    if (currentStatus === "APPROVED" && action === "approve") return

    const labels = { approve: "approvare", reject: "rifiutare" }
    if (!confirm(`Confermi di ${labels[action]} questa richiesta?`)) return

    setLoading(action)
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/users", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, action }),
        })
        if (!res.ok) throw new Error("Errore")
        toast.success(action === "approve" ? "Cliente approvato" : "Richiesta rifiutata")
        router.refresh()
      } catch {
        toast.error("Errore durante l'aggiornamento")
      } finally {
        setLoading(null)
      }
    })
  }

  return (
    <div className="flex gap-2">
      {currentStatus !== "APPROVED" && (
        <button
          type="button"
          onClick={() => changeStatus("approve")}
          disabled={isPending}
          className="rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading === "approve" ? "..." : "Approva"}
        </button>
      )}
      {currentStatus !== "REJECTED" && (
        <button
          type="button"
          onClick={() => changeStatus("reject")}
          disabled={isPending}
          className="rounded-full border border-red-300 px-4 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          {loading === "reject" ? "..." : "Rifiuta"}
        </button>
      )}
    </div>
  )
}
