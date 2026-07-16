import { redirect } from "next/navigation"
import { getCustomerSession } from "@/lib/customer-auth"
import { prisma } from "@/lib/prisma"
import { AddressesClient } from "./client"

export default async function AddressesPage() {
  const session = await getCustomerSession()
  if (!session) redirect("/auth/login")

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { status: true, role: true },
  })

  if (!user || user.role !== "user" || user.status !== "APPROVED") {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <p className="font-medium">Sezione non disponibile</p>
        <p className="mt-1 text-amber-800">
          La gestione degli indirizzi sarà disponibile dopo l&apos;approvazione del tuo account.
        </p>
      </div>
    )
  }

  const addresses = await prisma.address.findMany({
    where: { userId: session.userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-semibold text-zinc-900">Indirizzi</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Salva gli indirizzi di spedizione che usi più spesso. L&apos;indirizzo predefinito
          verrà proposto al checkout.
        </p>
      </div>

      <AddressesClient
        initialAddresses={addresses.map((a) => ({
          id: a.id,
          label: a.label,
          firstName: a.firstName,
          lastName: a.lastName,
          company: a.company,
          address: a.address,
          address2: a.address2,
          city: a.city,
          province: a.province,
          postalCode: a.postalCode,
          country: a.country,
          phone: a.phone,
          isDefault: a.isDefault,
        }))}
      />
    </div>
  )
}
