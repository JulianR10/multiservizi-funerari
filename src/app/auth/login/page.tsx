"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { loginCustomer } from "@/app/actions/customer-auth"
import { adminLogin } from "@/app/actions/admin-auth"
import { useActionState } from "react"

function AdminForm() {
  const router = useRouter()
  const [state, action, pending] = useActionState(
    async (_prev: { error: string } | undefined, formData: FormData) => {
      const result = await adminLogin(formData)
      if (result?.error) return result
      router.push("/admin/products")
      return undefined
    },
    undefined
  )

  return (
    <form action={action} className="mt-8 space-y-4">
      {state?.error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">{state.error}</p>
      )}
      <div>
        <label htmlFor="admin-email" className="block text-sm font-medium text-zinc-700">Username o Email</label>
        <input id="admin-email" name="email" type="text" required autoComplete="username"
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900" />
      </div>
      <div>
        <label htmlFor="admin-password" className="block text-sm font-medium text-zinc-700">Password</label>
        <input id="admin-password" name="password" type="password" required autoComplete="current-password"
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900" />
      </div>
      <button type="submit" disabled={pending}
        className="w-full rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50">
        {pending ? "Accesso in corso..." : "Accedi"}
      </button>
      <p className="text-center text-sm text-zinc-500">
        <a href="/auth/forgot-password" className="font-medium text-zinc-900 hover:text-zinc-600">Password dimenticata?</a>
      </p>
    </form>
  )
}

function CustomerForm() {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ email: "", password: "" })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)
    const result = await loginCustomer(form)
    if (result.success) {
      router.push("/account")
      router.refresh()
    } else {
      setError(result.error || "Errore durante l'accesso")
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div>
        <label htmlFor="customer-email" className="block text-sm font-medium text-zinc-700">Email</label>
        <input id="customer-email" type="email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={pending}
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900" />
      </div>
      <div>
        <label htmlFor="customer-password" className="block text-sm font-medium text-zinc-700">Password</label>
        <input id="customer-password" type="password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} disabled={pending}
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={pending}
        className="w-full rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50">
        {pending ? "Accesso..." : "Accedi"}
      </button>
      <p className="text-center text-sm text-zinc-500">
        Non hai un account?{" "}
        <Link href="/auth/register" className="font-medium text-primary hover:text-primary-hover">Registrati</Link>
      </p>
    </form>
  )
}

export default function UnifiedLoginPage() {
  const [tab, setTab] = useState<"cliente" | "amministratore">("cliente")

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-heading text-center text-3xl font-bold text-zinc-900">Accedi</h1>

      <div className="mt-8 flex rounded-lg border border-zinc-200 p-1">
        <button
          onClick={() => setTab("cliente")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
            tab === "cliente" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          Cliente
        </button>
        <button
          onClick={() => setTab("amministratore")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
            tab === "amministratore" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          Amministratore
        </button>
      </div>

      {tab === "cliente" ? <CustomerForm /> : <AdminForm />}
    </div>
  )
}
