"use server"

import crypto from "crypto"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { COMPANY } from "@/lib/company"

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email") as string
  if (!email) return { error: "Inserisci un indirizzo email" }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.password) {
    return { error: "Se l'email è registrata, riceverai un link per il reset." }
  }

  const token = crypto.randomBytes(32).toString("hex")
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex")
  const expires = new Date(Date.now() + 60 * 60 * 1000)

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: tokenHash, resetTokenExpires: expires },
  })

  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000"
  const resetUrl = `${baseUrl}/auth/reset-password/${token}`

  await sendEmail({
    to: email,
    subject: "Reimposta la tua password — Petrungaro Multiservizi",
    html: `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#F5F0EB;">
  <table role="presentation" style="width:100%;background-color:#F5F0EB;padding:24px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" style="max-width:480px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background-color:#772123;padding:32px 24px;text-align:center;">
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:20px;color:#ffffff;">Reimposta la password</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 24px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#27272a;">Riceviamo una richiesta di reimpostazione della password per il tuo account.</p>
              <p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#52525b;">Clicca il pulsante qui sotto per impostare una nuova password. Questo link è valido per 1 ora.</p>
              <div style="text-align:center;margin:28px 0;">
                <a href="${resetUrl}" target="_blank" style="display:inline-block;background-color:#772123;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:15px;font-weight:600;font-family:Arial,Helvetica,sans-serif;">Reimposta password</a>
              </div>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#a1a1aa;">Se non hai richiesto il reset, ignora questa email.</p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#faf0f0;padding:20px 24px;text-align:center;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#a1a1aa;">${COMPANY.displayName} — ${COMPANY.address} — ${COMPANY.city}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  })

  return { success: true, message: "Se l'email è registrata, riceverai un link per il reset." }
}

export async function resetPassword(formData: FormData) {
  const token = formData.get("token") as string
  const password = formData.get("password") as string
  const confirm = formData.get("confirmPassword") as string

  if (!token) return { error: "Token mancante" }
  if (!password || password.length < 8) return { error: "La password deve essere di almeno 8 caratteri" }
  if (password !== confirm) return { error: "Le password non coincidono" }

  const tokenHash = crypto.createHash("sha256").update(token!).digest("hex")

  const user = await prisma.user.findFirst({
    where: { resetToken: tokenHash },
  })

  if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
    return { error: "Token non valido o scaduto. Richiedi un nuovo reset." }
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: passwordHash,
      resetToken: null,
      resetTokenExpires: null,
    },
  })

  return { success: true, message: "Password reimpostata con successo. Ora puoi accedere." }
}
