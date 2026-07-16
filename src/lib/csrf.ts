import { SignJWT, jwtVerify } from "jose"
import { cookies, headers } from "next/headers"
import { getSecret } from "./session"

export async function generateCsrfToken(): Promise<string> {
  return await new SignJWT({ purpose: "csrf" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(getSecret())
}

export async function verifyCsrfToken(token: string): Promise<boolean> {
  if (!token || typeof token !== "string") return false
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload.purpose === "csrf"
  } catch {
    return false
  }
}

export async function verifyCsrfFromRequest(): Promise<boolean> {
  const h = await headers()
  const headerToken = h.get("x-csrf-token")
  const c = await cookies()
  const cookieToken = c.get("csrf_token")?.value
  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return false
  }
  return await verifyCsrfToken(cookieToken)
}
