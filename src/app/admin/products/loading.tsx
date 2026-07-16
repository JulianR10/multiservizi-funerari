export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="h-9 w-48 animate-pulse rounded bg-zinc-200" />
        <div className="h-10 w-36 animate-pulse rounded-full bg-zinc-200" />
      </div>

      <div className="mt-8 overflow-x-auto rounded-lg border border-zinc-200">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              {["Prodotto", "Categoria", "Prezzo", "Stock", "Stato", "Azioni"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium uppercase text-zinc-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-chalk">
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="hover:bg-zinc-50">
                <td className="px-6 py-4"><div className="h-4 w-32 animate-pulse rounded bg-zinc-200" /></td>
                <td className="px-6 py-4"><div className="h-4 w-24 animate-pulse rounded bg-zinc-200" /></td>
                <td className="px-6 py-4"><div className="h-4 w-16 animate-pulse rounded bg-zinc-200" /></td>
                <td className="px-6 py-4"><div className="h-4 w-10 animate-pulse rounded bg-zinc-200" /></td>
                <td className="px-6 py-4"><div className="h-5 w-20 animate-pulse rounded-full bg-zinc-200" /></td>
                <td className="px-6 py-4"><div className="ml-auto h-4 w-16 animate-pulse rounded bg-zinc-200" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
