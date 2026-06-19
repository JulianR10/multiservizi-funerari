import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ProductForm } from "@/components/ProductForm"
import { assertAdminPage } from "@/lib/admin-guard"

export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
  await assertAdminPage()
  const { id } = await props.params

  const product: any = await prisma.product.findUnique({
    where: { id },
  })

  if (!product) notFound()

  const categories: any[] = await prisma.category.findMany({
    orderBy: { name: "asc" },
  })

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-bold text-zinc-900">Modifica prodotto</h1>
      <p className="mt-1 text-sm text-zinc-500">Modifica i dettagli di {product.name}.</p>
      <div className="mt-8">
        <ProductForm categories={categories} product={product} />
      </div>
    </div>
  )
}
