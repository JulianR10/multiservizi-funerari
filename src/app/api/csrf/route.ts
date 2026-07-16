import { NextResponse } from "next/server"
import { generateCsrfToken } from "@/lib/csrf"

export async function GET() {
  const token = await generateCsrfToken()
  const res = NextResponse.json({ token })
  res.cookies.set("csrf_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 3600,
    path: "/",
  })
  return res
}
