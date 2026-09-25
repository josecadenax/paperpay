import type { Metadata } from 'next'
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google'
import { Navbar } from '@/components/Navbar'
import './globals.css'

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://paperpay-pi.vercel.app'
const TITLE = 'PaperPay · Micropagos para la ciencia'
const DESCRIPTION =
  'Lee artículos científicos pagando por artículo con tu wallet, sin cuenta ni suscripción. Micropagos sobre Stellar con el estándar abierto HTTP 402.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: '%s · PaperPay' },
  description: DESCRIPTION,
  applicationName: 'PaperPay',
  openGraph: {
    type: 'website',
    siteName: 'PaperPay',
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    locale: 'es_MX',
    images: [{ url: '/brand/og-banner.jpg', width: 1376, height: 768, alt: 'PaperPay — Micropayments for Academic Research' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/brand/og-banner.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" className={`${fraunces.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen bg-background text-foreground">
        <Navbar />
        <p className="border-b border-border bg-muted px-4 py-2 text-center text-xs text-muted-foreground">
          Prototipo de demostración: artículos ficticios y pagos reales aún sin verificar.
        </p>
        {children}
      </body>
    </html>
  )
}
