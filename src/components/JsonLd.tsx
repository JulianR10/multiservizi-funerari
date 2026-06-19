export function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Petrungaro Multiservizi",
    description: "Il tuo negozio di fiducia per servizi e prodotti di qualità. Assistenza 24 ore su 24, 7 giorni su 7.",
    url: process.env.NEXT_PUBLIC_URL,
    telephone: ["+39 335 6691440", "+39 335 6691117", "+39 335 1316192", "+39 0982 71580"],
    email: "mf@multiservizifunerarisrl.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Via Trento, 11, II° Trav.",
      addressLocality: "Fiumefreddo Bruzio",
      addressRegion: "CS",
      postalCode: "87030",
      addressCountry: "IT",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59",
    },
    sameAs: [
      "https://facebook.com/petrungaromultiservizi",
      "https://instagram.com/petrungaromultiservizi",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Prodotti e servizi funerari",
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
