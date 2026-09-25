'use client'

import { useEffect, useState } from 'react'
import { COPY } from '@/lib/copy'
import { formatDateTime, shortHash } from '@/lib/format'
import { getEditorialStats, type EditorialStats } from '@/services/editorial'

const cardClass = 'rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]'
const usd = (n: number) => `$${n.toFixed(2)}`

function ReadsChart({ perDay }: { perDay: EditorialStats['perDay'] }) {
  const max = Math.max(1, ...perDay.map((d) => d.count))
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <div className={`${cardClass} p-6`}>
      <h3 className="mb-6 font-display text-base font-semibold text-foreground">{COPY.dashboard.chartTitle}</h3>
      <div className="flex h-[120px] items-end gap-1.5" role="img" aria-label={COPY.dashboard.chartTitle}>
        {perDay.map((d, i) => (
          <div
            key={i}
            className="relative flex h-full flex-1 cursor-pointer flex-col items-center justify-end"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {hovered === i && (
              <div className="absolute -top-9 left-1/2 z-10 -translate-x-1/2 rounded-lg bg-foreground px-2 py-1 text-xs font-semibold whitespace-nowrap text-white">
                {d.count} {COPY.dashboard.readsUnit}
              </div>
            )}
            <div
              className={`min-h-1 w-full rounded-t-sm transition-colors ${hovered === i ? 'bg-primary' : 'bg-primary/25'}`}
              style={{ height: `${(d.count / max) * 100}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5">
        {perDay.map((d, i) => (
          <div key={i} className="flex-1 overflow-hidden text-center">
            {i % 2 === 0 && <span className="block truncate text-[0.65rem] text-muted-foreground">{d.label}</span>}
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
        <Legend color="bg-success" value="98%" label={COPY.dashboard.distributionPublisher} />
        <Legend color="bg-primary" value="2%" label={COPY.dashboard.distributionPlatform} />
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
  const [stats, setStats] = useState<EditorialStats | null>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)
    getEditorialStats()
      .then((s) => !cancelled && setStats(s))
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [attempt])

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-1 font-display text-3xl font-semibold text-foreground">{dashboard.title}</h1>
          <p className="text-sm text-muted-foreground">{dashboard.subtitle}</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-success-bg px-3 py-1 text-xs font-semibold text-success-strong">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          {dashboard.liveBadge}
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : error || !stats ? (
        <div className="py-24 text-center">
          <p className="mb-6 font-display text-lg text-muted-foreground">{dashboard.loadError}</p>
          <button
            type="button"
            onClick={() => setAttempt((n) => n + 1)}
            className="min-h-[44px] rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            {dashboard.retry}
          </button>
        </div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <KpiCard label={dashboard.kpis.reads} value={String(stats.reads)} sub={dashboard.kpis.readsSub} />
            <KpiCard label={dashboard.kpis.earnings} value={usd(stats.publisherUsdc)} sub={dashboard.kpis.earningsSub} valueClass="text-success" />
            <KpiCard label={dashboard.kpis.fee} value={usd(stats.feeUsdc)} sub={dashboard.kpis.feeSub} valueClass="text-primary" />
          </div>

          <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
            <ReadsChart perDay={stats.perDay} />
            <DistributionBar />
          </div>

          <div className={`${cardClass} overflow-hidden`}>
            <div className="border-b border-border px-6 py-5">
              <h3 className="font-display text-base font-semibold text-foreground">{dashboard.txTitle}</h3>
            </div>
            {stats.recent.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-muted-foreground">{dashboard.txEmpty}</p>
            ) : (
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
                    {stats.recent.map((tx) => (
                      <tr key={tx.hash} className="border-b border-border transition-colors last:border-0 hover:bg-muted">
                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{formatDateTime(tx.date)}</td>
                        <td className="px-6 py-4 font-semibold text-success">{usd(tx.amount)}</td>
                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{shortHash(tx.from, 4)}</td>
                        <td className="px-6 py-4">
                          <a
                            href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-muted px-2 py-1 font-mono text-xs text-primary hover:underline"
                          >
                            {shortHash(tx.hash, 6)}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </main>
  )
}
