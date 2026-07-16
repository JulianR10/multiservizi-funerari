import { NextResponse } from "next/server"
import { getCustomerSession } from "./customer-auth"

export async function assertCustomerApi(): Promise<NextResponse | null> {
  const session = await getCustomerSession()
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  }
  if (session.status === "REJECTED" || session.status === "PENDING") {
    return NextResponse.json(
      { error: "Il tuo account non è abilitato" },
      { status: 403 }
    )
  }
  return null
}

export async function assertCustomerPage() {
  const session = await getCustomerSession()
  if (!session) {
    const { redirect } = await import("next/navigation")
    redirect("/auth/login")
  }
  if (session && (session.status === "REJECTED" || session.status === "PENDING")) {
    const { redirect } = await import("next/navigation")
    redirect("/account?status=" + session.status.toLowerCase())
  }
}
