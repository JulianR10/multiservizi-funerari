import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

const RAW_SECRET = process.env.AUTH_SECRET
let _secret: Uint8Array | null = null

export function getSecret(): Uint8Array {
  if (!_secret) {
    if (!RAW_SECRET || RAW_SECRET === "fallback-secret") {
      throw new Error(
        "AUTH_SECRET environment variable is not set or is using the insecure fallback. " +
        "Generate a secure secret with: openssl rand -base64 32"
      )
    }
    _secret = new TextEncoder().encode(RAW_SECRET)
  }
  return _secret
}

export async function createSession(
  payload: Record<string, unknown>,
  cookieName: string,
  maxAgeSeconds: number
) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(getSecret())

  const c = await cookies()
  c.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: maxAgeSeconds,
    path: "/",
  })

  return token
}

export async function getSession<T = Record<string, unknown>>(
  cookieName: string
): Promise<T | null> {
  const c = await cookies()
  const token = c.get(cookieName)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as unknown as T
  } catch {
    return null
  }
}

export async function destroySession(cookieName: string) {
  const c = await cookies()
  c.delete(cookieName)
}
