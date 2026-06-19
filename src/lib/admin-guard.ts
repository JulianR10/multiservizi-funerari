import { redirect } from "next/navigation"
import { NextResponse } from "next/server"
import { getAdminSession } from "./admin-auth"

export async function assertAdminApi(): Promise<NextResponse | null> {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  }
  return null
}

export async function assertAdminPage() {
  const session = await getAdminSession()
  if (!session) {
    redirect("/auth/login")
  }
}
