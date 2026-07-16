import { assertAdminPage } from "@/lib/admin-guard"
import { prisma } from "@/lib/prisma"
import { ShippingManager } from "./client"

export default async function AdminShippingPage() {
  await assertAdminPage()

  const methods = await prisma.shippingMethod.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
  })

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Metodi di spedizione</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Gestisci i metodi di spedizione proposti al checkout. I metodi disattivati non
          vengono mostrati ma restano associati agli ordini esistenti.
        </p>
      </div>

      <ShippingManager
        initial={methods.map((m) => ({
          id: m.id,
          name: m.name,
          slug: m.slug,
          description: m.description,
          price: m.price,
          estimatedDaysMin: m.estimatedDaysMin,
          estimatedDaysMax: m.estimatedDaysMax,
          active: m.active,
        }))}
      />
    </div>
  )
}
