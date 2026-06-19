import type { Metadata } from "next";
import { Suspense } from "react";
import { Cormorant_Garamond, Lato } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { NavbarWrapper } from "@/components/NavbarWrapper";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/components/CartProvider";
import { BackToTop } from "@/components/BackToTop";
import { CookieBanner } from "@/components/CookieBanner";
import { JsonLd } from "@/components/JsonLd";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000"

export const metadata: Metadata = {
  title: {
    default: "Petrungaro Multiservizi | Servizi e prodotti funerari",
    template: "%s | Petrungaro Multiservizi",
  },
  description: "Il tuo negozio di fiducia per servizi e prodotti funerari di qualità. Assistenza 24 ore su 24, 7 giorni su 7. A Fiumefreddo Bruzio (CS).",
  keywords: ["petrungaro", "multiservizi", "servizi funerari", "Fiumefreddo Bruzio", "onoranze funebri", "Cosenza"],
  authors: [{ name: "Petrungaro Multiservizi" }],
  metadataBase: new URL(baseUrl),
  openGraph: {
    title: "Petrungaro Multiservizi | Servizi e prodotti funerari",
    description: "Il tuo negozio di fiducia per servizi e prodotti funerari di qualità. Assistenza 24 ore su 24.",
    url: baseUrl,
    siteName: "Petrungaro Multiservizi",
    locale: "it_IT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Petrungaro Multiservizi",
    description: "Il tuo negozio di fiducia per servizi e prodotti funerari di qualità.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${cormorant.variable} ${lato.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-chalk" suppressHydrationWarning>
        <JsonLd />
        <CartProvider>
          <Suspense fallback={<div className="h-[70px] animate-pulse bg-secondary-bg" />}>
            <NavbarWrapper>
              <Navbar />
            </NavbarWrapper>
          </Suspense>
          <main className="flex-1">{children}</main>
          <Suspense fallback={<div className="h-64 animate-pulse bg-chalk" />}>
            <Footer />
          </Suspense>
        </CartProvider>
        <BackToTop />
        <CookieBanner />
      </body>
    </html>
  );
}
