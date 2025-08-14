import './globals.css'
import type { Metadata } from 'next'
import { TranslationProvider } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'Club Esportiu Joventut - Sant Josep de sa Talaia, Ibiza, Baleares',
  description: 'Club de tenis de mesa inclusivo en Baleares',
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="font-inter">
        <TranslationProvider>
          {children}
        </TranslationProvider>
      </body>
    </html>
  )
}
