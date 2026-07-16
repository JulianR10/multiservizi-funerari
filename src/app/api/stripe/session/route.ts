import { NextResponse } from "next/server"
import { setPaymentProvider, getSession } from "@/lib/payments"
import { stripeAdapter } from "@/lib/payment-adapters/stripe-adapter"

setPaymentProvider(stripeAdapter)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get("session_id")

  if (!sessionId) {
    return NextResponse.json({ error: "session_id richiesto" }, { status: 400 })
  }

  try {
    const session = await getSession(sessionId)
    return NextResponse.json(session)
  } catch {
    return NextResponse.json({ error: "Sessione non trovata" }, { status: 404 })
  }
}
