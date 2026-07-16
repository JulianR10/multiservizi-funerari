import { NextRequest, NextResponse } from "next/server"
import { getAdminSession } from "@/lib/admin-auth"
import { writeAuditLog } from "@/lib/audit"
import { uploadProductImage, isStorageConfigured, MAX_BYTES } from "@/lib/storage"

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
  }

  if (!isStorageConfigured()) {
    return NextResponse.json(
      { error: "Storage non configurato (BLOB_READ_WRITE_TOKEN mancante)" },
      { status: 503 }
    )
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: "Body non valido" }, { status: 400 })
  }

  const file = formData.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File mancante" }, { status: 400 })
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File troppo grande. Massimo 5 MB." },
      { status: 400 }
    )
  }

  try {
    const result = await uploadProductImage(file)
    await writeAuditLog({
      actorId: session.userId,
      actorEmail: session.email,
      action: "product.update",
      entity: "Product",
      entityId: "upload",
      metadata: { url: result.url, size: result.size, type: result.type },
    })
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Errore durante l'upload"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
