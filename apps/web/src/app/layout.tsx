import type { Metadata } from 'next'
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google'
import { Navbar } from '@/components/Navbar'
import './globals.css'

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' })

export const metadata: Metadata = {
  title: 'PaperPay · Demo de micropagos científicos',
  description: 'Prototipo de paywall con artículos ficticios y pagos de demostración.',
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
