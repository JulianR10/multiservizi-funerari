"use client"

import { useRouter } from "next/navigation"
import { logoutCustomer } from "@/app/actions/customer-auth"

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await logoutCustomer()
    router.push("/")
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
    >
      Esci
    </button>
  )
}
