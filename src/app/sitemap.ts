import type { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000"

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({
      select: { slug: true, updatedAt: true },
    }),
  ])

  const productUrls = products.map((p) => ({
    url: `${baseUrl}/prodotti/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  const categoryUrls = categories.map((c) => ({
    url: `${baseUrl}/prodotti?category=${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }))

  return [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/prodotti`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/carrello`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/checkout`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/track`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/auth/login`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/auth/register`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/dati-societari`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/termini`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/cookies`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/recesso`, changeFrequency: "yearly", priority: 0.3 },
    ...productUrls,
    ...categoryUrls,
  ]
}
