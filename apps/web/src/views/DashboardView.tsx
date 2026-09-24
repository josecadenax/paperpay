'use client'

import { useState } from 'react'
import { COPY } from '@/lib/copy'

// Datos de ejemplo: el panel editorial no tiene backend en el MVP.
const READS_14_DAYS = [62, 88, 45, 110, 97, 130, 85, 74, 119, 143, 98, 156, 132, 145]

const TX_ROWS = [
  { minutesAgo: 38, paper: 'Autonomous Agentic Payments', hash: 'a1b2c3d4...e5f6a7b8' },
  { minutesAgo: 121, paper: 'Lattice-Based Post-Quantum Cryptography', hash: 'b7c8d9e0...f1a2b3c4' },
  { minutesAgo: 1460, paper: 'Targeted Lipid Nanoparticle Delivery', hash: 'c3d4e5f6...a7b8c9d0' },
  { minutesAgo: 1715, paper: 'Autonomous Agentic Payments', hash: 'd9e0f1a2...b3c4d5e6' },
  { minutesAgo: 2890, paper: 'Lattice-Based Post-Quantum Cryptography', hash: 'e5f6a7b8...c9d0e1f2' },
  { minutesAgo: 4210, paper: 'Targeted Lipid Nanoparticle Delivery', hash: 'f1a2b3c4...d5e6f7a8' },
]

const dayLabel = (daysAgo: number) => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' }).format(d)
}

const txDate = (minutesAgo: number) =>
  new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(Date.now() - minutesAgo * 60_000),
  )

const cardClass = 'rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]'

function ReadsChart() {
  const max = Math.max(...READS_14_DAYS)
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <div className={`${cardClass} p-6`}>
      <h3 className="mb-6 font-display text-base font-semibold text-foreground">{COPY.dashboard.chartTitle}</h3>
      <div className="flex h-[120px] items-end gap-1.5" role="img" aria-label={COPY.dashboard.chartTitle}>
        {READS_14_DAYS.map((value, i) => (
          <div
            key={i}
            className="relative flex h-full flex-1 cursor-pointer flex-col items-center justify-end"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {hovered === i && (
              <div className="absolute -top-9 left-1/2 z-10 -translate-x-1/2 rounded-lg bg-foreground px-2 py-1 text-xs font-semibold whitespace-nowrap text-white">
                {value} {COPY.dashboard.readsUnit}
              </div>
            )}
            <div
              className={`min-h-1 w-full rounded-t-sm transition-colors ${hovered === i ? 'bg-primary' : 'bg-primary/25'}`}
              style={{ height: `${(value / max) * 100}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5">
        {READS_14_DAYS.map((_, i) => (
          <div key={i} className="flex-1 overflow-hidden text-center">
            {i % 2 === 0 && <span className="block truncate text-[0.65rem] text-muted-foreground">{dayLabel(13 - i)}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

function DistributionBar() {
  return (
    <div className={`${cardClass} p-6`}>
      <h3 className="mb-5 font-display text-base font-semibold text-foreground">{COPY.dashboard.distributionTitle}</h3>
      <div className="mb-4 flex h-4 overflow-hidden rounded-full">
        <div className="w-[98%] bg-success" />
        <div className="w-[2%] bg-primary" />
      </div>
      <div className="flex items-center gap-6">
        <Legend color="bg-success" value="98% · $0.49" label={COPY.dashboard.distributionPublisher} />
        <Legend color="bg-primary" value="2% · $0.01" label={COPY.dashboard.distributionPlatform} />
      </div>
    </div>
  )
}

function Legend({ color, value, label }: { color: string; value: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 flex-shrink-0 rounded-sm ${color}`} />
      <div>
        <p className="text-xs font-semibold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

function KpiCard({ label, value, sub, valueClass = 'text-foreground' }: { label: string; value: string; sub: string; valueClass?: string }) {
  return (
    <div className={`${cardClass} p-6`}>
      <p className="mb-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">{label}</p>
      <p className={`mb-1 font-display text-3xl leading-none font-semibold ${valueClass}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  )
}

export function DashboardView() {
  const { dashboard } = COPY

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-1 font-display text-3xl font-semibold text-foreground">{dashboard.title}</h1>
          <p className="text-sm text-muted-foreground">{dashboard.subtitle}</p>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">{dashboard.demoBadge}</span>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <KpiCard label={dashboard.kpis.reads} value="1,284" sub={dashboard.kpis.readsSub} />
        <KpiCard label={dashboard.kpis.earnings} value="$629.16" sub={dashboard.kpis.earningsSub} valueClass="text-success" />
        <KpiCard label={dashboard.kpis.fee} value="$12.84" sub={dashboard.kpis.feeSub} valueClass="text-primary" />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
        <ReadsChart />
        <DistributionBar />
      </div>

      <div className={`${cardClass} overflow-hidden`}>
        <div className="border-b border-border px-6 py-5">
          <h3 className="font-display text-base font-semibold text-foreground">{dashboard.txTitle}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {Object.values(dashboard.txHeaders).map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TX_ROWS.map((row) => (
                <tr key={row.hash} className="border-b border-border transition-colors last:border-0 hover:bg-muted">
                  <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{txDate(row.minutesAgo)}</td>
                  <td className="max-w-xs truncate px-6 py-4 text-foreground">{row.paper}</td>
                  <td className="px-6 py-4 font-semibold text-success">$0.49</td>
                  <td className="px-6 py-4">
                    <span className="rounded-lg bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">{row.hash}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
