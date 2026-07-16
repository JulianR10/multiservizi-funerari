import { NextResponse } from "next/server"
import {
  setPaymentProvider,
  confirmOrder,
  handleChargeRefunded,
  handlePaymentFailed,
  handleCheckoutExpired,
} from "@/lib/payments"
import { stripeAdapter } from "@/lib/payment-adapters/stripe-adapter"

setPaymentProvider(stripeAdapter)

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event
  try {
    event = stripeAdapter.constructWebhookEvent(body, signature)
  } catch (err) {
    console.error("[WEBHOOK] Invalid signature:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await confirmOrder(event)
        break
      case "charge.refunded":
        await handleChargeRefunded(event)
        break
      case "payment_intent.payment_failed":
        await handlePaymentFailed(event)
        break
      case "checkout.session.expired":
        await handleCheckoutExpired(event)
        break
    }
  } catch (err) {
    console.error(`[WEBHOOK] Errore gestione evento ${event.type}:`, err)
  }

  return NextResponse.json({ received: true })
}
