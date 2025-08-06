import './globals.css'
import type { Metadata } from 'next'
import { TranslationProvider } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'Club Esportiu Joventut - Excelencia en Tenis de Mesa',
  description: 'Club de tenis de mesa premier ofreciendo entrenamiento para todos los niveles de habilidad',
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
