import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"
import { setPaymentProvider, createCheckout } from "@/lib/payments"
import { stripeAdapter } from "@/lib/payment-adapters/stripe-adapter"
import { validateCheckoutItems, isValidEmail } from "@/lib/validators"

setPaymentProvider(stripeAdapter)

export async function POST(req: Request) {
  const ip = getClientIp(req)
  const { allowed } = checkRateLimit(`checkout:${ip}`, 10, 60_000)
  if (!allowed) {
    return NextResponse.json({ error: "Troppe richieste. Riprova tra qualche minuto." }, { status: 429 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Body non valido" }, { status: 400 })
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Body non valido" }, { status: 400 })
  }

  const { items, email, address, billingAddress, shippingMethodId, userId } = body as Record<string, unknown>

  const itemsResult = validateCheckoutItems(items)
  if (!itemsResult.ok) {
    return NextResponse.json({ error: itemsResult.error }, { status: 400 })
  }

  if (typeof email !== "string" || !isValidEmail(email)) {
    return NextResponse.json({ error: "Email non valida" }, { status: 400 })
  }

  if (userId !== undefined && (typeof userId !== "string" || userId.length === 0 || userId.length > 64)) {
    return NextResponse.json({ error: "userId non valido" }, { status: 400 })
  }

  if (shippingMethodId !== undefined && shippingMethodId !== null) {
    if (typeof shippingMethodId !== "string" || shippingMethodId.length === 0 || shippingMethodId.length > 64) {
      return NextResponse.json({ error: "shippingMethodId non valido" }, { status: 400 })
    }
  }

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId as string },
      select: { role: true, status: true },
    })
    if (!user || user.role !== "user" || user.status !== "APPROVED") {
      return NextResponse.json({ error: "Account non abilitato all'acquisto." }, { status: 403 })
    }
  }

  try {
    const result = await createCheckout({
      items: itemsResult.items,
      customerEmail: email as string,
      userId: typeof userId === "string" ? userId : undefined,
      shippingMethodId: typeof shippingMethodId === "string" ? shippingMethodId : undefined,
      shippingAddress: (address && typeof address === "object" ? address : undefined) as
        | Record<string, string>
        | undefined,
      billingAddress: (billingAddress && typeof billingAddress === "object" ? billingAddress : undefined) as
        | Record<string, string>
        | undefined,
    })

    return NextResponse.json({ url: result.url })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Errore durante il checkout"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
