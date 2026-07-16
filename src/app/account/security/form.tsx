"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { changePassword } from "@/app/actions/customer-profile"

export function SecurityForm({ hasPassword }: { hasPassword: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSuccess(false)
    startTransition(async () => {
      const result = await changePassword({
        currentPassword: String(formData.get("currentPassword") || ""),
        newPassword: String(formData.get("newPassword") || ""),
        confirmPassword: String(formData.get("confirmPassword") || ""),
      })
      if (result.success) {
        setSuccess(true)
        toast.success("Password aggiornata correttamente")
        const form = document.getElementById("security-form") as HTMLFormElement | null
        form?.reset()
      } else {
        setError(result.error || "Errore durante l'aggiornamento")
        toast.error(result.error || "Errore")
      }
    })
  }

  return (
    <form id="security-form" action={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Password aggiornata correttamente.
        </div>
      )}

      <section className="rounded-lg border border-zinc-200 bg-white p-6">
        <h3 className="text-sm font-semibold text-zinc-900">Cambia password</h3>
        <p className="mt-1 text-xs text-zinc-500">
          La password deve essere di almeno 8 caratteri.
        </p>
        <div className="mt-4 grid gap-4 sm:max-w-md">
          {hasPassword && (
            <div>
              <label className="block text-xs font-medium text-zinc-700">Password attuale</label>
              <input
                type="password"
                name="currentPassword"
                required
                autoComplete="current-password"
                className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-zinc-700">Nuova password</label>
            <input
              type="password"
              name="newPassword"
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700">Conferma nuova password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </section>

      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-chalk hover:bg-primary-hover disabled:opacity-50"
        >
          {isPending ? "Aggiornamento…" : "Aggiorna password"}
        </button>
      </div>
    </form>
  )
}
