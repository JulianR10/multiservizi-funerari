"use client"

import { useState } from "react"
import { requestPasswordReset } from "@/app/actions/password-reset"

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)
    const result = await requestPasswordReset(form)
    if (result?.error) {
      setError(result.error)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-chalk">
        <div className="w-full max-w-md px-4 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">Richiesta inviata</h1>
          <p className="mt-3 text-sm text-zinc-600 leading-relaxed">
            Se l&apos;indirizzo email è registrato, riceverai un link per reimpostare la password.
            Controlla la tua casella di posta.
          </p>
          <a href="/auth/login" className="mt-6 inline-block text-sm font-medium text-primary hover:text-primary-hover">
            Torna al login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-chalk">
      <div className="w-full max-w-md px-4">
        <h1 className="text-2xl font-bold text-zinc-900">Password dimenticata</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Inserisci la tua email e ti invieremo un link per reimpostare la password.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Invia link di reset
          </button>

          <p className="text-center text-sm text-zinc-500">
            <a href="/auth/login" className="font-medium text-zinc-900 hover:text-zinc-600">
              Torna al login
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}
