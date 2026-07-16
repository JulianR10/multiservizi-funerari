import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdminApi } from "@/lib/admin-guard"
import { getAdminSession } from "@/lib/admin-auth"
import { writeAuditLog } from "@/lib/audit"

export async function GET() {
  const unauthorized = await assertAdminApi()
  if (unauthorized) return unauthorized

  const users = await prisma.user.findMany({
    where: { role: "user" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      companyName: true,
      vatNumber: true,
      legalForm: true,
      businessType: true,
      phone: true,
      city: true,
      province: true,
      notes: true,
      status: true,
      createdAt: true,
    },
  })

  return NextResponse.json(users)
}

export async function PATCH(request: NextRequest) {
  const authError = await assertAdminApi()
  if (authError) return authError

  const admin = await getAdminSession()

  const { userId, action } = await request.json()

  if (!userId || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Dati non validi" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.role !== "user") {
    return NextResponse.json({ error: "Utente non trovato" }, { status: 404 })
  }

  const status = action === "approve" ? "APPROVED" : "REJECTED"

  await prisma.user.update({
    where: { id: userId },
    data: { status },
  })

  await writeAuditLog({
    actorId: admin?.userId,
    actorEmail: admin?.email,
    action: action === "approve" ? "user.approve" : "user.reject",
    entity: "User",
    entityId: userId,
    metadata: { from: user.status, to: status, email: user.email },
  })

  if (action === "approve") {
    try {
      const { resend } = await import("@/lib/resend")
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "Petrungaro Multiservizi <onboarding@resend.dev>",
        to: user.email,
        subject: "Registrazione approvata — Petrungaro Multiservizi",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background-color:#772123;padding:24px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:20px;">Richiesta approvata</h1>
            </div>
            <div style="padding:24px;color:#27272a;">
              <p style="font-size:14px;">Gentile ${user.companyName || user.name},</p>
              <p style="font-size:14px;">La tua richiesta di registrazione al portale Petrungaro Multiservizi è stata approvata.</p>
              <p style="font-size:14px;">Ora puoi accedere al listino prezzi e acquistare i nostri prodotti.</p>
              <p style="text-align:center;margin-top:24px;">
                <a href="${process.env.NEXT_PUBLIC_URL}/account/login" style="display:inline-block;background-color:#772123;color:#fff;text-decoration:none;padding:12px 24px;border-radius:50px;font-size:14px;font-weight:600;">
                  Accedi al tuo account
                </a>
              </p>
            </div>
          </div>
        `,
      })
    } catch (err) {
      console.error(`[ADMIN] Errore invio email approvazione a ${user.email}:`, err)
    }
  }

  return NextResponse.json({ success: true })
}
