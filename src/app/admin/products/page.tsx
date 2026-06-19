import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/format"
import { assertAdminPage } from "@/lib/admin-guard"

export default async function AdminProductsPage() {
  await assertAdminPage()

  const products: any[] = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-900">Gestione Prodotti</h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Nuovo prodotto
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-lg border border-zinc-200">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-zinc-500">Prodotto</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-zinc-500">Categoria</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-zinc-500">Prezzo</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-zinc-500">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-zinc-500">Stato</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-zinc-500">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-chalk">
            {products.map((product: any) => (
              <tr key={product.id} className="hover:bg-zinc-50">
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-zinc-900">
                  {product.name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500">
                  {product.category.name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-900">
                  {formatPrice(product.price)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500">
                  {product.stock}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      product.published
                        ? "bg-green-100 text-green-700"
                        : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {product.published ? "Pubblicato" : "Bozza"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="font-medium text-zinc-900 hover:text-zinc-600"
                  >
                    Modifica
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
