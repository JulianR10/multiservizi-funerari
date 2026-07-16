"use client"

import { useState, useEffect, useCallback } from "react"

type UserRequest = {
  id: string
  email: string
  name: string | null
  companyName: string | null
  vatNumber: string | null
  legalForm: string | null
  businessType: string | null
  phone: string | null
  city: string | null
  province: string | null
  notes: string | null
  status: string
  createdAt: string
}

const LEGAL_FORM_LABELS: Record<string, string> = {
  SRL: "SRL/SRLS",
  SAS: "SAS/SNC",
  COOPERATIVA: "Cooperativa",
  DITTA_INDIVIDUALE: "Ditta Individuale",
  ALTRO: "Altro",
}

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  ONORANZE_FUNEBRI: "Onoranze Funebri",
  COSTRUTTORE: "Costruttore/Rivenditore",
  MARMISTA: "Marmista",
  FIORISTA: "Fiorista",
  ALTRO: "Altro",
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users")
      if (res.ok) setUsers(await res.json())
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  async function handleAction(userId: string, action: "approve" | "reject") {
    setProcessing(userId)
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      })
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId))
      }
    } catch {
      /* ignore */
    } finally {
      setProcessing(null)
    }
  }

  const pendingUsers = users.filter((u) => u.status === "PENDING")
  const otherUsers = users.filter((u) => u.status !== "PENDING")

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-zinc-900">Richieste di registrazione</h1>

      {loading ? (
        <p className="mt-6 text-zinc-500">Caricamento...</p>
      ) : (
        <>
          {pendingUsers.length === 0 ? (
            <div className="mt-6 rounded-lg border border-zinc-200 bg-chalk p-8 text-center">
              <p className="text-zinc-500">Nessuna richiesta in attesa.</p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {pendingUsers.map((user) => (
                <div key={user.id} className="rounded-lg border border-zinc-200 bg-chalk p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-semibold text-zinc-900">{user.companyName || user.name}</p>
                      <p className="text-sm text-zinc-500">
                        {user.email} {user.vatNumber && `· P.IVA ${user.vatNumber}`}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {user.businessType && BUSINESS_TYPE_LABELS[user.businessType]}
                        {user.legalForm && ` · ${LEGAL_FORM_LABELS[user.legalForm]}`}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {user.city && user.province && `${user.city} (${user.province})`}
                        {user.phone && ` · ${user.phone}`}
                      </p>
                      <p className="text-xs text-zinc-400">
                        Richiesto il {new Date(user.createdAt).toLocaleDateString("it-IT")}
                      </p>
                      {user.notes && (
                        <p className="mt-2 text-sm italic text-zinc-500">Note: {user.notes}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(user.id, "approve")}
                          disabled={processing === user.id}
                          className="cursor-pointer rounded-full bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {processing === user.id ? "..." : "Approva"}
                        </button>
                        <button
                          onClick={() => handleAction(user.id, "reject")}
                          disabled={processing === user.id}
                          className="cursor-pointer rounded-full bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          Rifiuta
                        </button>
                      </div>
                      <a
                        href={`/admin/users/${user.id}`}
                        className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
                      >
                        Vedi dettaglio →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {otherUsers.length > 0 && (
            <details className="mt-10">
              <summary className="cursor-pointer text-sm font-medium text-zinc-500 hover:text-zinc-700">
                Storico ({otherUsers.length} utenti)
              </summary>
              <div className="mt-4 space-y-3">
                {otherUsers.map((user) => (
                  <div key={user.id} className="rounded-lg border border-zinc-200 bg-chalk p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-zinc-900">{user.companyName || user.name}</p>
                        <p className="text-xs text-zinc-500">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        }`}>
                          {user.status === "APPROVED" ? "Approvato" : "Rifiutato"}
                        </span>
                        <a
                          href={`/admin/users/${user.id}`}
                          className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
                        >
                          Dettaglio →
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}
        </>
      )}
    </div>
  )
}
