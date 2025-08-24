// apps/marketing/app/layout.tsx
import "./globals.css"
import type { Metadata, Viewport } from "next"
import { cookies } from "next/headers"
import { TranslationProvider } from "@cej/i18n"
import { Toaster } from "@cej/ui"

// Importamos los diccionarios directamente desde el package
import es from "./dictionaries/es.json"
import en from "./dictionaries/en.json"
import ca from "./dictionaries/ca.json"

// Componentes locales (elimínalos si no existen)
import FooterLegal from "@/components/footer-legal"
import CookieConsent from "@/components/cookie-consent"

// Metadata y viewport
export const metadata: Metadata = {
  title: "Club Esportiu Joventut - Sant Josep de sa Talaia, Ibiza, Baleares",
  description: "Club de tenis de mesa inclusivo en Baleares"
}

export const viewport: Viewport = {
  themeColor: "#0f172a"
}

// Diccionarios cargados en el servidor
const DICTS = { es, en, ca } as const
type Language = keyof typeof DICTS

 console.log("🟢 [DEBUG] Estoy ejecutando apps/marketing/app/layout.tsx");

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const raw = (cookieStore.get("lang")?.value ?? "es") as string
  const allowed: ReadonlyArray<Language> = ["es", "en", "ca"] as const
  const lang: Language = (allowed as readonly string[]).includes(raw)
    ? (raw as Language)
    : "es"

  const dictionary = DICTS[lang]

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className="font-inter bg-dark text-white">
        <TranslationProvider initialLanguage={lang} dictionary={dictionary}>
          {children}
          <CookieConsent />
          <FooterLegal />
          <Toaster />
        </TranslationProvider>
      </body>
    </html>
  )
}
