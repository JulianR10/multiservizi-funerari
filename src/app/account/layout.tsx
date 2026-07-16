import Link from "next/link"
import { getCustomerSession } from "@/lib/customer-auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { AccountTabs } from "./tabs"

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getCustomerSession()
  if (!session) {
    redirect("/auth/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true, status: true, companyName: true },
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500">Area riservata</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold text-zinc-900">
            {user?.companyName || user?.name || user?.email}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">{user?.email}</p>
        </div>
        <Link
          href="/auth/logout"
          className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Esci
        </Link>
      </div>

      <AccountTabs status={user?.status || "PENDING"} />

      <div className="mt-8">{children}</div>
    </div>
  )
}
