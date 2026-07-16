import { createSession, destroySession, getSession } from "./session"

type AdminSession = { userId: string; email: string; role: string }

const COOKIE = "admin_session"
const MAX_AGE = 60 * 60 * 24 // 24h

export async function createAdminSession(userId: string, email: string) {
  await createSession({ userId, email, role: "admin" }, COOKIE, MAX_AGE)
}

export async function destroyAdminSession() {
  await destroySession(COOKIE)
}

export async function getAdminSession(): Promise<{ userId: string; email: string } | null> {
  const session = await getSession<AdminSession>(COOKIE)
  if (!session || session.role !== "admin") return null
  return { userId: session.userId, email: session.email }
}
