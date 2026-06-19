import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
})

async function main() {
  const categories: { name: string; slug: string; children?: { name: string; slug: string }[] }[] = [
    {
      name: "Promozioni",
      slug: "promozioni",
    },
    {
      name: "Accessori per cofani",
      slug: "accessori-per-cofani",
      children: [
        { name: "Alzacoperchi", slug: "alzacoperchi" },
        { name: "Parure/Completi per cofani", slug: "parure-completi-per-cofani" },
        { name: "Minuteria", slug: "minuteria" },
      ],
    },
    {
      name: "Arredi & Velluti",
      slug: "arredi-velluti",
      children: [
        { name: "Accessori di arredamento", slug: "accessori-di-arredamento" },
        { name: "Copricarrelli", slug: "copricarrelli" },
        { name: "Fondali", slug: "fondali" },
        { name: "Portamanifesti e coccarde", slug: "portamanifesti-e-coccarde" },
        { name: "Tappeti per camera ardente", slug: "tappeti-per-camera-ardente" },
        { name: "Tavoli firme", slug: "tavoli-firme" },
      ],
    },
    {
      name: "Esposizione",
      slug: "esposizione",
      children: [
        { name: "Candelieri", slug: "candelieri" },
        { name: "Camere ardenti per case funerarie", slug: "camere-ardenti-per-case-funerarie" },
        { name: "Colonne & Dipinti", slug: "colonne-dipinti" },
        { name: "Lumini e Accessori", slug: "lumini-e-accessori" },
        { name: "Portaofferte", slug: "portaofferte" },
        { name: "Fondali Roll-up", slug: "fondali-roll-up" },
      ],
    },
    {
      name: "Articoli Igienici – Sanitari",
      slug: "articoli-igienici-sanitari",
      children: [
        { name: "Disinfettanti", slug: "disinfettanti" },
        { name: "Indumenti protettivi", slug: "indumenti-protettivi" },
        { name: "Prodotti assorbenti", slug: "prodotti-assorbenti" },
        { name: "Trasporto e recupero salme", slug: "trasporto-e-recupero-salme" },
        { name: "Valvole depuratrici", slug: "valvole-depuratrici" },
        { name: "Vestizione e preparazione salma", slug: "vestizione-e-preparazione-salma" },
      ],
    },
    {
      name: "Articoli per Infanti",
      slug: "articoli-per-infanti",
    },
    {
      name: "Articoli per saldatura",
      slug: "articoli-per-saldatura",
      children: [
        { name: "Bombole gas", slug: "bombole-gas" },
        { name: "Flussanti/stagno", slug: "flussanti-stagno" },
        { name: "Mazze", slug: "mazze" },
        { name: "Ricambi", slug: "ricambi" },
        { name: "Saldatori", slug: "saldatori" },
        { name: "Valigette", slug: "valigette" },
        { name: "Sigillanti/Imballaggio", slug: "sigillanti-imballaggio" },
      ],
    },
    {
      name: "Carrelli e Catafalchi",
      slug: "carrelli-e-catafalchi",
      children: [
        { name: "Carrelli", slug: "carrelli" },
        { name: "Catafalchi", slug: "catafalchi" },
      ],
    },
    {
      name: "Cartotecnica",
      slug: "cartotecnica",
      children: [
        { name: "Biglietti lutto", slug: "biglietti-lutto" },
        { name: "Libri firma", slug: "libri-firma" },
        { name: "Ricordini lutto", slug: "ricordini-lutto" },
      ],
    },
    {
      name: "Cassoni",
      slug: "cassoni",
      children: [
        { name: "Cassoni /cassettine ossarie", slug: "cassoni-cassettine-ossarie" },
        { name: "Frigoriferi per salme e cassoni", slug: "frigoriferi-per-salme-e-cassoni" },
      ],
    },
    {
      name: "Coroncine & Oggettistica",
      slug: "coroncine-oggettistica",
    },
    {
      name: "Gadget",
      slug: "gadget",
    },
    {
      name: "Imbottiture Veli & Coltrini",
      slug: "imbottiture-veli-coltrini",
      children: [
        { name: "Coltrini", slug: "coltrini" },
        { name: "Imbottiture a sacco", slug: "imbottiture-a-sacco" },
        { name: "Imbottiture su cartone", slug: "imbottiture-su-cartone" },
        { name: "Veli coprisalma", slug: "veli-coprisalma" },
        { name: "Veli coprizinco e copricassa aerografati", slug: "veli-coprizinco-e-copricassa-aerografati" },
      ],
    },
    {
      name: "Targhe & Pantografi",
      slug: "targhe-pantografi",
      children: [
        { name: "Provvisori e cimiteriale", slug: "provvisori-e-cimiteriale" },
        { name: "Pantografi e Incisori", slug: "pantografi-e-incisori" },
        { name: "Placche per cofani", slug: "placche-per-cofani" },
        { name: "Targhe alluminio", slug: "targhe-alluminio" },
        { name: "Targhe in ottone", slug: "targhe-in-ottone" },
      ],
    },
    {
      name: "Urne Cinerarie",
      slug: "urne-cinerarie",
      children: [
        { name: "Urne artistiche", slug: "urne-artistiche" },
        { name: "Urne in legno", slug: "urne-in-legno" },
        { name: "Urne in metallo", slug: "urne-in-metallo" },
        { name: "Urne in ceramica", slug: "urne-in-ceramica" },
        { name: "Urne biodegradabili", slug: "urne-biodegradabili" },
        { name: "Urne per animali", slug: "urne-per-animali" },
      ],
    },
  ]

  for (const cat of categories) {
    const parent = await prisma.category.create({
      data: { name: cat.name, slug: cat.slug },
    })

    if (cat.children) {
      for (const child of cat.children) {
        await prisma.category.create({
          data: { name: child.name, slug: child.slug, parentId: parent.id },
        })
      }
    }
  }

  const allCats = await prisma.category.findMany()
  const catMap = Object.fromEntries(allCats.map((c) => [c.slug, c.id]))

  const productData = [
    { name: "Cofano in zinco modello classico", price: 89900, cat: "accessori-per-cofani", featured: true, stock: 10 },
    { name: "Candeliero in ottone 5 pz", price: 24900, cat: "candelieri", featured: true, stock: 25 },
    { name: "Urna cineraria in legno noce", price: 15900, cat: "urne-in-legno", featured: true, stock: 15 },
    { name: "Tappeto per camera ardente cm 200x300", price: 8900, cat: "tappeti-per-camera-ardente", stock: 20 },
    { name: "Libro firma lutto copertina rigida", price: 2900, cat: "libri-firma", stock: 50 },
    { name: "Disinfettante superfici 5L", price: 1900, cat: "disinfettanti", stock: 100 },
    { name: "Targa alluminio personalizzata", price: 4900, cat: "targhe-alluminio", stock: 30 },
    { name: "Imbottitura a sacco bianca", price: 3900, cat: "imbottiture-a-sacco", stock: 40 },
    { name: "Coltrino raso pregiato", price: 12900, cat: "coltrini", featured: true, stock: 12 },
    { name: "Set candelieri plexiglass curvo", price: 34900, cat: "candelieri", featured: true, stock: 8 },
  ]

  for (const p of productData) {
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    await prisma.product.create({
      data: {
        name: p.name,
        slug,
        price: p.price,
        comparePrice: null,
        categoryId: catMap[p.cat] || allCats[0].id,
        stock: p.stock,
        published: true,
        featured: p.featured || false,
        description: `${p.name}. Prodotto di alta qualità, ideale per uso professionale.`,
        images: [],
      },
    })
  }

  await prisma.user.upsert({
    where: { email: "admin@petrungaro.it" },
    update: {},
    create: {
      email: "admin@petrungaro.it",
      name: "Admin",
      password: "$2a$12$LJ3m4ys3Lg3YOCwKkYcKfeRKm1Qo5mPbYq1y5Z5q0e5y5q0e5y5qO",
      role: "admin",
    },
  })

  console.log("Seed completato!")
  console.log(`- ${categories.length} categorie create (con sottocategorie)`)
  console.log(`- ${productData.length} prodotti creati`)
  console.log("- Admin: admin@petrungaro.it")
}

main()
  .catch((e: unknown) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
