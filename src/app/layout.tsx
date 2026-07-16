import type { Metadata } from "next";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Cormorant_Garamond, Lato } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { NavbarWrapper } from "@/components/NavbarWrapper";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/components/CartProvider";
import { BackToTop } from "@/components/BackToTop";
import { CookieBanner } from "@/components/CookieBanner";
import { JsonLd } from "@/components/JsonLd";
import { CartSlideOver } from "@/components/CartSlideOver";
import { FloatingCartButton } from "@/components/FloatingCartButton";
import { Toaster } from "sonner";
import { HideOnAdmin, MainWithPadding } from "@/components/HideOnAdmin";
import { OfflineBanner } from "@/components/OfflineBanner";

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
      <body className="min-h-full flex flex-col font-sans bg-chalk text-balance" suppressHydrationWarning>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg"
        >
          Vai al contenuto principale
        </a>
        <JsonLd />
        <CartProvider>
          <Suspense fallback={null}>
            <HideOnAdmin>
              <Suspense fallback={<div className="h-[70px] animate-pulse bg-secondary-bg" />}>
                <NavbarWrapper>
                  <Navbar />
                </NavbarWrapper>
              </Suspense>
            </HideOnAdmin>
          </Suspense>
          <Suspense fallback={null}>
            <MainWithPadding>{children}</MainWithPadding>
          </Suspense>
          <Suspense fallback={null}>
            <HideOnAdmin>
              <Suspense fallback={<div className="h-64 animate-pulse bg-chalk" />}>
                <Footer />
              </Suspense>
            </HideOnAdmin>
          </Suspense>
        </CartProvider>
        <CartSlideOver />
        <FloatingCartButton />
        <BackToTop />
        <Suspense fallback={null}>
          <HideOnAdmin>
            <CookieBanner />
          </HideOnAdmin>
        </Suspense>
        <Analytics />
        <OfflineBanner />
        <Toaster
          position="bottom-left"
          toastOptions={{
            style: {
              background: "#EDE5DD",
              color: "#1a1a1a",
              border: "1px solid #d4ccc4",
              fontSize: "0.875rem",
            },
          }}
          aria-live="polite"
        />
      </body>
    </html>
  );
}
