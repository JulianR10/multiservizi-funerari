import { redirect } from "next/navigation"
import { getCustomerSession } from "@/lib/customer-auth"
import { prisma } from "@/lib/prisma"
import { ProfileForm } from "./form"

export default async function ProfilePage() {
  const session = await getCustomerSession()
  if (!session) redirect("/auth/login")

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      companyName: true,
      vatNumber: true,
      taxCode: true,
      sdiCode: true,
      legalForm: true,
      businessType: true,
      phone: true,
      city: true,
      province: true,
      address: true,
      postalCode: true,
      notes: true,
      status: true,
    },
  })

  if (!user || user.status !== "APPROVED") {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <p className="font-medium">Profilo non modificabile</p>
        <p className="mt-1 text-amber-800">
          La modifica dei dati aziendali è disponibile solo dopo l&apos;approvazione della richiesta.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-semibold text-zinc-900">Dati azienda</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Aggiorna ragione sociale, Partita IVA, codice SDI e indirizzo. I dati vengono
          utilizzati per la fatturazione.
        </p>
      </div>

      <ProfileForm
        user={{
          id: user.id,
          email: user.email,
          companyName: user.companyName || "",
          vatNumber: user.vatNumber || "",
          taxCode: user.taxCode || "",
          sdiCode: user.sdiCode || "",
          legalForm: user.legalForm || "",
          businessType: user.businessType || "",
          phone: user.phone || "",
          city: user.city || "",
          province: user.province || "",
          address: user.address || "",
          postalCode: user.postalCode || "",
          notes: user.notes || "",
        }}
      />
    </div>
  )
}
