import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"
import { readdirSync } from "node:fs"
import { join } from "node:path"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
})

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

async function mapProductImages(productName: string): Promise<string[]> {
  const slug = slugify(productName)
  const dir = join(process.cwd(), "public", "images", "products")
  let files: string[] = []
  try {
    files = readdirSync(dir)
  } catch {
    return []
  }

  const webpFiles = files.filter((f) => f.endsWith(".webp"))

  const matches = webpFiles
    .filter((f) => {
      const base = f.replace(/ \(\d+\)\.webp$/, "").replace(/\.webp$/, "")
      return base.includes(slug) || slug.includes(base)
    })
    .sort()
    .map((f) => `/images/products/${f}`)

  return matches
}

type SeedProduct = {
  name: string
  variants?: string[]
}

async function main() {
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.address.deleteMany()
  await prisma.shippingMethod.deleteMany()

  const categoryData = [
    { name: "Linea Marmi", slug: "linea-marmi" },
    { name: "Accessori Cimiteriali", slug: "accessori-cimiteriali" },
    { name: "Articoli Funebri", slug: "articoli-funebri" },
    { name: "Fotoceramiche", slug: "fotoceramiche" },
  ]

  const createdCategories: Record<string, string> = {}
  for (const cat of categoryData) {
    const created = await prisma.category.create({
      data: { name: cat.name, slug: cat.slug },
    })
    createdCategories[cat.slug] = created.id
  }

  const articoliFunebriId = createdCategories["articoli-funebri"]

  const productData: SeedProduct[] = [
    // ── Prodotti singoli (senza varianti) ──
    { name: "Vite a croce" },
    { name: "Ferma scarpe" },
    { name: "Copri vite a rosa strass" },
    { name: "Mentoniere a vite" },
    { name: "Viti a farfalla" },
    { name: "Cappello del prete" },
    { name: "Chiodo croce 7×25" },
    { name: "Coprivite margherita" },
    { name: "Rosari in plastica" },
    { name: "Rose decorative con strass e vite" },
    { name: "Viti decorative con strass vari" },
    { name: "Anelli ferma mani regolabili" },
    { name: "Ferma scarpe in ottone" },
    { name: "Posizionatore per mani" },
    { name: "Fermabocca in plastica" },
    { name: "Pellicola autosigillante" },
    { name: "Deosalm" },
    { name: "Enzisalm" },
    { name: "Odorstop" },
    { name: "Deodor-Bag" },
    { name: "Micro-Pure" },
    { name: "Secure-Mani" },
    { name: "Hydro Stop Bag" },
    { name: "Hydro Stop 200 gr" },
    { name: "Flussante per saldatura" },
    { name: "Bombola usa e getta" },
    { name: "Spray battericida" },
    { name: "Rossetti – Tavolozza 6" },
    { name: "Tintura per labbra" },
    { name: "Cera da ricostruzione" },
    { name: "Colla" },
    { name: "Filo di sutura" },
    { name: "Soluzione leva smalto" },
    { name: "Calzari in TNT" },
    { name: "Copricapo in TNT" },
    { name: "Camice in TNT" },
    { name: "Sacco in juta" },
    { name: "Sacco in tessuto elasticizzato" },
    { name: "Targhe adesive ovali e rettangolari" },
    { name: "Foglio per targhetta rettangolare" },
    { name: "Foglio per targhetta ovale" },
    { name: "Fogli in memoriam" },
    { name: "Scatoline porta offerta" },
    { name: "Urna Swarovski" },
    { name: "Urna Linea Venezia" },
    { name: "Urna porcellana bianco" },
    { name: "Urna cineraria in acciaio verniciato – Rosa decorativa bianca" },
    { name: "Urna acciaio nera con croce oro" },
    { name: "Urna Athena" },
    { name: "Urna Diana" },
    { name: "Urna Dafne" },
    { name: "Urna Medea" },
    { name: "Urna Rubino C24 – Rovere con rosa rossa" },
    { name: "Urna Rubino C1 – Frassino con stampa calla" },
    { name: "Urna Rubino D10 – Frassino con orchidea incisa" },
    { name: "Urna Gardenia C24 – Frassino con ibiscus rosa" },
    { name: "Urna Rubino – Noce" },
    { name: "Urna Rubino B8C8 – Frassino" },
    { name: "Urna Libro D7 – Frassino" },
    { name: "Urna Zaffiro – Mogano" },
    { name: "Urna Turchese – Mogano" },
    { name: "Absol" },
    { name: "K Sap gel" },
    { name: "Bio Funer-Bag" },
    { name: "Valigia porta saldatore" },
    { name: "Acido flussante per saldatura" },
    { name: "Telo biodegradabile" },
    { name: "Saldatore Diana" },
    { name: "Raccoglitore porta offerte" },
    { name: "Guanto Hirex NT" },
    { name: "Guanto Walking Nitrile" },
    { name: "Guanto Walking Extreme" },
    { name: "Guanto Export 631" },
    { name: "Guanto Latex Pro" },
    { name: "Guanto Hirex" },
    { name: "Guanto Satinox" },
    { name: "Croce in legno Cristo in metallo 15 cm" },
    { name: "Croce argentata e dorata 13 cm" },
    { name: "Croce in legno Cristo dorato 13 cm" },
    { name: "Croce in legno 11 cm" },
    { name: "Siringa formalina monouso" },
    { name: "Cristo in ottone" },
    { name: "Sacro Cuore in ottone" },
    { name: "Passione di Cristo in ottone" },
    { name: "Madonna con Bambino in ottone" },
    { name: "Padre Pio in ottone" },
    { name: "Sacra Famiglia in ottone" },
    { name: "Cristo in preghiera in ottone" },
    { name: "Croce in ottone – Pastore con gregge" },
    { name: "Croce con decorazioni in ottone" },
    { name: "Cristo in preghiera (R)" },
    { name: "Guanto Hi Risks" },
    { name: "Valigia per saldatore" },
    { name: "Colla spray" },
    { name: "Stampante nastri senza PC" },
    { name: "Croce liscia – Ottone lucido 111/S" },
    { name: "Croce rame con Cristo 158/S" },
    { name: "Croce in silver liscia 145/S" },
    { name: "Croce con punto luce" },
    { name: "Croce con strass e rosa" },
    { name: "Maniglia semplice" },
    { name: "Ossario in zinco" },
    { name: "Tuta protettiva Tyvek" },
    { name: "Cassetta per arti in zinco 80×29 cm" },
    { name: "Colla manifesti" },
    { name: "Camera ardente completa" },
    { name: "Camera ardente BLU" },
    { name: "Veli e imbottiture" },

    // ── Prodotti con varianti (metadata.variants) ──
    { name: "Viti Ø 4,5 mm – Oro", variants: ["H₁ 60", "H₂ 50", "H₃ 40", "H₄ 30"] },
    { name: "Sfere in ottone", variants: ["Naturale", "Nichel", "Rame"] },
    { name: "Alza coperchio", variants: ["Ottone lucido", "Nichel"] },
    { name: "Mentoniere biodegradabile", variants: ["Medium", "Large"] },
    { name: "Fermaocchi in plastica", variants: ["Large", "Medium"] },
    { name: "Lacca colorata", variants: ["Castano", "Biondo"] },
    { name: "Sacco in TNT", variants: ["65 gr Bianco", "130 gr BLU"] },
    { name: "Libri firme", variants: ["Colomba", "Padre Pio", "Cristo", "Madonna", "Ramo spiga", "Tramonto", "Fiori", "Croce"] },
    { name: "Porta documenti", variants: ["Blu", "Bordeaux"] },
    { name: "Porta libro firme", variants: ["Grande Blu", "Grande Bordeaux", "Piccolo Blu", "Piccolo Bordeaux"] },
    { name: "Targhe in metallo", variants: [
      "Grandi ovali fondo oro bordo nero", "Grandi ovali fondo nero bordo oro",
      "Grandi rettangolari fondo oro bordo nero", "Grandi rettangolari fondo nero bordo oro",
      "Piccole ovali fondo oro bordo nero", "Piccole ovali fondo nero bordo oro",
      "Piccole rettangolari fondo oro bordo nero", "Piccole rettangolari fondo nero bordo oro",
    ]},
    { name: "Urna cineraria in acciaio verniciato", variants: ["Nero", "Marrone"] },
    { name: "Urna cineraria dispersione ceneri", variants: ["Verde scuro", "Blu", "Argento"] },
    { name: "Guanti per portantini in cotone", variants: ["Bianchi", "Neri", "Blu"] },
    { name: "Flacone dispensatore per acido con pennellino", variants: ["Ceabis", "Marini"] },
    { name: "Mazza Long Life", variants: ["500 g", "300 g"] },
    { name: "Croce metallo 11 cm", variants: ["Oro", "Argento"] },
    { name: "Croce in legno Cristo 15 cm", variants: ["Argentato", "Dorato"] },
    { name: "Croce in legno Cristo 11 cm", variants: ["Argentato", "Dorato"] },
    { name: "Immagine sacra", variants: ["Cristo Risorto", "Passione di Cristo"] },
    { name: "Madonna in ottone", variants: ["Standard", "Piccola"] },
    { name: "Fregio in ottone", variants: ["Cristo", "Madonna"] },
    { name: "Miniatura", variants: ["Cristo", "Padre Pio"] },
    { name: "Croce con Cristo 143/S", variants: ["Ottone lucido", "Rame"] },
    { name: "Croce con strass", variants: ["Dritti", "Cuori"] },
    { name: "Maniglia con strass", variants: ["Singolo", "Doppio"] },
    { name: "Carrello a fisarmonica porta bara", variants: ["Verde", "Nero"] },
    { name: "Sabbia per incisioni lapidi", variants: ["F40 – grossa", "F36 – media", "F60 – piccola"] },
    { name: "Vinile plotter scrittura incisioni", variants: ["Blu", "Beige"] },
    { name: "Paravento funebre", variants: ["San Francesco", "La Pietà"] },
    { name: "Valvola depuratrice", variants: ["Standard", "Economy"] },
    { name: "Cartuccia", variants: ["Oro", "Argento", "Nera"] },
    { name: "Nastro per coronella 100mm 50m – LORD", variants: ["Verde scuro", "Verde chiaro", "Viola chiaro", "Viola scuro", "Bianco", "Bordeaux", "Ocra"] },
    { name: "Nastro per coronella 100mm 50m – ATHENIS", variants: ["Bordeaux", "Viola scuro", "Viola chiaro"] },
    { name: "Nastro per coronella 100mm 50m – CLEOPATRA", variants: ["Ocra chiaro", "Ocra scuro"] },
  ]

  let created = 0
  let withImages = 0
  let withVariants = 0
  for (const p of productData) {
    const slug = slugify(p.name)
    const images = await mapProductImages(p.name)
    const metadata = p.variants
      ? { variants: p.variants.map((v) => ({ label: v, value: slugify(v) })) }
      : undefined

    await prisma.product.create({
      data: {
        name: p.name,
        slug,
        price: 0,
        description: null,
        categoryId: articoliFunebriId,
        stock: 0,
        published: true,
        images,
        metadata: metadata ?? undefined,
      },
    })
    created++
    if (images.length > 0) withImages++
    if (metadata) withVariants++
  }

  const passwordHash = await bcrypt.hash("admin123", 12)
  await prisma.user.upsert({
    where: { email: "admin@petrungaro.it" },
    update: { username: "admin", password: passwordHash },
    create: {
      email: "admin@petrungaro.it",
      username: "admin",
      name: "Admin",
      password: passwordHash,
      role: "admin",
      status: "APPROVED",
    },
  })

  const testPassword = await bcrypt.hash("test1234", 12)
  await prisma.user.upsert({
    where: { email: "rossi@test.it" },
    update: {},
    create: {
      email: "rossi@test.it",
      name: "Mario Rossi",
      password: testPassword,
      role: "user",
      status: "APPROVED",
      companyName: "Onoranze Funebri Rossi",
      vatNumber: "01234567890",
      sdiCode: "ABC123",
      legalForm: "DITTA_INDIVIDUALE",
      businessType: "ONORANZE_FUNEBRI",
      phone: "+39 333 1234567",
      city: "Fiumefreddo Bruzio",
      province: "CS",
      address: "Via Roma 12",
      postalCode: "87030",
    },
  })

  const shippingMethods = [
    { name: "Standard", slug: "standard", price: 790, estimatedDaysMin: 3, estimatedDaysMax: 7, description: "Consegna in 3-7 giorni lavorativi" },
    { name: "Espresso", slug: "espresso", price: 1490, estimatedDaysMin: 1, estimatedDaysMax: 2, description: "Consegna in 1-2 giorni lavorativi" },
    { name: "Ritiro in sede", slug: "ritiro-in-sede", price: 0, estimatedDaysMin: null, estimatedDaysMax: null, description: "Ritira il tuo ordine presso il nostro punto vendita" },
  ]

  for (const method of shippingMethods) {
    await prisma.shippingMethod.create({
      data: {
        name: method.name,
        slug: method.slug,
        price: method.price,
        description: method.description,
        estimatedDaysMin: method.estimatedDaysMin ?? undefined,
        estimatedDaysMax: method.estimatedDaysMax ?? undefined,
      },
    })
  }

  console.log("Seed completato!")
  console.log(`- ${categoryData.length} categorie create`)
  console.log(`- ${created} prodotti creati (${withImages} con immagini, ${withVariants} con varianti)`)
  console.log(`- ${shippingMethods.length} metodi di spedizione creati`)
  console.log("- Admin: admin@petrungaro.it / admin123")
  console.log("- Test B2B: rossi@test.it / test1234 (APPROVED)")
}

main()
  .catch((e: unknown) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
