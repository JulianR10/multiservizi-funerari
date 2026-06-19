import { LoginForm } from "./form"

export default function LoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-zinc-900">Accesso amministratore</h1>
        <p className="mt-1 text-sm text-zinc-600">Riservato al personale autorizzato.</p>
        <LoginForm />
      </div>
    </div>
  )
}
