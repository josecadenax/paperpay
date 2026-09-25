'use client'

import { useEffect, useState } from 'react'
import { getEditorialStats } from '@/services/editorial'

// Dato en vivo: lecturas ya liquidadas on-chain. Falla en silencio si no carga.
export function HeroStats() {
  const [reads, setReads] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    getEditorialStats()
      .then((s) => !cancelled && setReads(s.reads))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  if (reads === null || reads === 0) return null

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm shadow-[var(--shadow-card)]">
      <span className="flex h-2 w-2 items-center justify-center">
        <span className="h-2 w-2 animate-ping rounded-full bg-success opacity-75" />
        <span className="absolute h-2 w-2 rounded-full bg-success" />
      </span>
      <span className="font-semibold text-foreground">{reads.toLocaleString('es-MX')}</span>
      <span className="text-muted-foreground">lecturas liquidadas on-chain</span>
    </div>
  )
}
