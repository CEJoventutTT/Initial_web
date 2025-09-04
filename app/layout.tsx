// app/layout.tsx
import "./globals.css"
import type { Metadata } from "next"
import { cookies } from "next/headers"
import { TranslationProvider, type Language } from "@/lib/i18n"
import { Toaster } from "@/components/ui/toaster"
import FooterLegal from "@/components/footer-legal"
import CookieConsent from "@/components/cookie-consent"
import AuthHashCatcher from "@/components/auth-hash-catcher"

// Carga SSR de diccionarios
async function loadDict(lang: Language) {
  switch (lang) {
    case "ca":
      return (await import("@/lib/i18n/locales/ca.json")).default
    case "en":
      return (await import("@/lib/i18n/locales/en.json")).default
    default:
      return (await import("@/lib/i18n/locales/es.json")).default
  }
}

export const metadata: Metadata = {
  title: "Club Esportiu Joventut - Sant Josep de sa Talaia, Ibiza, Baleares",
  description: "Club de tenis de mesa inclusivo en Baleares",
  generator: "v0.dev",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/web-app-manifest-512x512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  },
  appleWebApp: {
    title: "Joventut"
  },
  manifest: "/site.webmanifest",
  themeColor: "#0f172a"
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const rawLang = cookieStore.get("lang")?.value ?? "es"
  const lang: Language = (["es", "en", "ca"] as const).includes(rawLang as Language)
    ? (rawLang as Language)
    : "es"

  const dict = await loadDict(lang)

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        {/* JSON-LD Schema.org */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SportsClub",
              "name": "Club Esportiu Joventut TT",
              "url": "https://cejoventut.com",
              "logo": "https://cejoventut.com/logo.png",
              "image": "https://cejoventut.com/10.jpg",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": " ",
                "addressLocality": "Sant Josep de sa Talaia",
                "addressRegion": "Illes Balears",
                "postalCode": "07830",
                "addressCountry": "ES"
              },
              "sport": "TableTennis",
              "email": "ce.joventut.tt@gmail.com"
            })
          }}
        />
      </head>
      <body className="font-inter bg-dark text-white">
        <TranslationProvider initialLanguage={lang} dictionary={dict}>
          {children}

          {/* Aviso de cookies */}
          <CookieConsent />

          {/* Footer con enlaces legales */}
          <FooterLegal />

          {/* Toaster global */}
          <Toaster />
        </TranslationProvider>
      </body>
    </html>
  )
}
