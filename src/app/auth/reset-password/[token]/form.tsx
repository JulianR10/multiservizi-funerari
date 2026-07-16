"use client"

import { useState } from "react"
import { resetPassword } from "@/app/actions/password-reset"

export function ResetPasswordForm({ token }: { token: string }) {
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)
    const result = await resetPassword(form)
    if (result?.error) {
      setError(result.error)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-chalk">
        <div className="w-full max-w-md px-4 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">Password reimpostata</h1>
          <p className="mt-3 text-sm text-zinc-600">Ora puoi accedere con la tua nuova password.</p>
          <a
            href="/auth/login"
            className="mt-6 inline-block rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Accedi
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-chalk">
      <div className="w-full max-w-md px-4">
        <h1 className="text-2xl font-bold text-zinc-900">Nuova password</h1>
        <p className="mt-2 text-sm text-zinc-600">Scegli una nuova password per il tuo account.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <input type="hidden" name="token" value={token} />

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
              Nuova password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-700">
              Conferma password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Reimposta password
          </button>
        </form>
      </div>
    </div>
  )
}
