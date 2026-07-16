import { redirect } from "next/navigation"
import { getCustomerSession } from "@/lib/customer-auth"
import { prisma } from "@/lib/prisma"
import { SecurityForm } from "./form"

export default async function SecurityPage() {
  const session = await getCustomerSession()
  if (!session) redirect("/auth/login")

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { status: true, password: true },
  })

  if (!user || user.status !== "APPROVED") {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <p className="font-medium">Sezione non disponibile</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-semibold text-zinc-900">Sicurezza</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Aggiorna la password del tuo account. Ti consigliamo di cambiarla periodicamente.
        </p>
      </div>

      <SecurityForm hasPassword={!!user.password} />
    </div>
  )
}
