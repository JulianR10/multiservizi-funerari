import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

const getSecret = () => new TextEncoder().encode(process.env.AUTH_SECRET || "fallback-secret")

export async function createAdminSession(userId: string, email: string) {
  const token = await new SignJWT({ userId, email, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getSecret())

  const c = await cookies()
  c.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  })
}

export async function destroyAdminSession() {
  const c = await cookies()
  c.delete("admin_session")
}

export async function getAdminSession(): Promise<{ userId: string; email: string } | null> {
  const c = await cookies()
  const token = c.get("admin_session")?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getSecret())
    if (payload.role !== "admin") return null
    return { userId: payload.userId as string, email: payload.email as string }
  } catch {
    return null
  }
}
