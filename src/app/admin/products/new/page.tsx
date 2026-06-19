import { prisma } from "@/lib/prisma"
import { ProductForm } from "@/components/ProductForm"
import { assertAdminPage } from "@/lib/admin-guard"

export default async function NewProductPage() {
  await assertAdminPage()

  const categories: any[] = await prisma.category.findMany({
    orderBy: { name: "asc" },
  })

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-bold text-zinc-900">Nuovo prodotto</h1>
      <p className="mt-1 text-sm text-zinc-500">Inserisci i dettagli del prodotto.</p>
      <div className="mt-8">
        <ProductForm categories={categories} />
      </div>
    </div>
  )
}
