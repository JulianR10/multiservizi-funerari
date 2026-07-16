import { redirect } from "next/navigation"
import Link from "next/link"
import { getCustomerSession } from "@/lib/customer-auth"
import { prisma } from "@/lib/prisma"
import { ListsClient } from "./client"

export default async function ListsPage() {
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
          Le liste della spesa sono disponibili dopo l&apos;approvazione del tuo account.
        </p>
      </div>
    )
  }

  const lists = await prisma.shoppingList.findMany({
    where: { userId: session.userId },
    orderBy: { updatedAt: "desc" },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, slug: true, images: true, price: true, stock: true, published: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-semibold text-zinc-900">
          Liste della spesa
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Salva gli articoli che acquisti spesso in liste riutilizzabili. Aggiungi tutto
          al carrello con un click.
        </p>
      </div>

      <ListsClient
        initialLists={lists.map((l) => ({
          id: l.id,
          name: l.name,
          notes: l.notes,
          createdAt: l.createdAt.toISOString(),
          updatedAt: l.updatedAt.toISOString(),
          items: l.items.map((it) => ({
            id: it.id,
            productId: it.productId,
            quantity: it.quantity,
            name: it.product.name,
            slug: it.product.slug,
            image: it.product.images[0] || "",
            price: it.product.price,
            stock: it.product.stock,
            published: it.product.published,
          })),
        }))}
      />

      <div className="rounded-lg border border-zinc-200 bg-chalk p-4 text-xs text-zinc-500">
        <p className="font-medium text-zinc-700">Suggerimento</p>
        <p className="mt-1">
          Da un ordine completato puoi salvare i suoi articoli come lista per riordinarli
          facilmente in futuro. Apri il dettaglio dell&apos;ordine in{" "}
          <Link href="/account/orders" className="text-primary hover:underline">
            I miei ordini
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
