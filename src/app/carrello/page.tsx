import Link from "next/link"
import { CartContent } from "./content"

type Props = {
  searchParams: Promise<{ cancelled?: string }>
}

export default async function CartPage({ searchParams }: Props) {
  const { cancelled } = await searchParams

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-bold text-zinc-900">Carrello</h1>
      {cancelled === "true" && (
        <div className="mt-4 flex items-center justify-between rounded-md bg-yellow-50 p-3 text-sm text-yellow-700">
          <span>Pagamento annullato. Il carrello è ancora disponibile.</span>
          <Link
            href="/checkout"
            className="ml-3 shrink-0 rounded-full bg-yellow-700 px-4 py-1.5 text-xs font-medium text-white hover:bg-yellow-800"
          >
            Riprova
          </Link>
        </div>
      )}
      <CartContent />
    </div>
  )
}
