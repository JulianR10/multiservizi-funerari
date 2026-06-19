import { Suspense } from "react"
import { CartContent } from "./content"
import { ClearCartOnSuccess } from "@/components/ClearCartOnSuccess"

type Props = {
  searchParams: Promise<{ cancelled?: string; success?: string }>
}

export default async function CartPage({ searchParams }: Props) {
  const { cancelled, success } = await searchParams

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Suspense fallback={null}>
        <ClearCartOnSuccess />
      </Suspense>
      <h1 className="text-3xl font-bold text-zinc-900">Carrello</h1>
      {cancelled && (
        <p className="mt-4 rounded-md bg-yellow-50 p-3 text-sm text-yellow-700">
          Pagamento annullato. Il carrello è ancora disponibile.
        </p>
      )}
      {success && (
        <p className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
          Ordine confermato con successo!
        </p>
      )}
      <CartContent />
    </div>
  )
}
