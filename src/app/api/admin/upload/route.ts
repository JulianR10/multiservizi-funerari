import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"
import { getAdminSession } from "@/lib/admin-auth"
import { writeAuditLog } from "@/lib/audit"

const ALLOWED_TYPES = new Set([
  "image/webp",
  "image/jpeg",
  "image/png",
  "image/avif",
])

const EXT_BY_TYPE: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/avif": "avif",
}

const MAX_BYTES = 5 * 1024 * 1024
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products")

function randomName(ext: string): string {
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 10)
  return `${ts}-${rand}.${ext}`
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File mancante" }, { status: 400 })
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Formato non supportato. Usa WebP, JPEG, PNG o AVIF." },
      { status: 400 }
    )
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File troppo grande. Massimo 5 MB." },
      { status: 400 }
    )
  }

  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }

  const ext = EXT_BY_TYPE[file.type] || "jpg"
  const filename = randomName(ext)
  const filepath = path.join(UPLOAD_DIR, filename)

  const bytes = Buffer.from(await file.arrayBuffer())
  await writeFile(filepath, bytes)

  await writeAuditLog({
    actorId: session.userId,
    actorEmail: session.email,
    action: "product.update",
    entity: "Product",
    entityId: "upload",
    metadata: { filename, size: file.size, type: file.type },
  })

  return NextResponse.json({
    url: `/uploads/products/${filename}`,
    filename,
    size: file.size,
    type: file.type,
  })
}
