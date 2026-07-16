import { TrackForm } from "./form"

type Props = {
  searchParams: Promise<{ email?: string }>
}

export default async function TrackPage({ searchParams }: Props) {
  const { email } = await searchParams

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-bold text-zinc-900">Cerca il tuo ordine</h1>
      <p className="mt-2 text-zinc-600">
        Inserisci l&apos;email che hai usato per il checkout per visualizzare i tuoi ordini.
      </p>
      <div className="mt-8">
        <TrackForm initialEmail={email || ""} />
      </div>
    </div>
  )
}
