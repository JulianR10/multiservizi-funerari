"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { adminLogout } from "@/app/actions/admin-auth"
import { logoutCustomer } from "@/app/actions/customer-auth"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    Promise.allSettled([adminLogout(), logoutCustomer()]).finally(() => {
      router.push("/auth/login")
    })
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-chalk">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-zinc-900">Uscita in corso...</h1>
        <p className="mt-2 text-zinc-500">Reindirizzamento al login.</p>
      </div>
    </div>
  )
}
