'use client'

import { useEffect, useMemo, useState } from 'react'
import { HeroPreview } from '@/components/HeroPreview'
import { HeroStats } from '@/components/HeroStats'
import { PaperCard } from '@/components/PaperCard'
import { COPY } from '@/lib/copy'
import type { PaperPreview } from '@/lib/types'
import { getPapers } from '@/services/paperpay'

export function HomeView() {
  const [papers, setPapers] = useState<PaperPreview[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [query, setQuery] = useState('')
  const [discipline, setDiscipline] = useState(COPY.home.allDisciplines)

  useEffect(() => {
    setLoading(true)
    setLoadError(false)
    getPapers()
      .then(setPapers)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false))
  }, [attempt])

  const disciplines = useMemo(() => {
    const found = papers.map((p) => p.discipline).filter((d): d is string => Boolean(d))
    return [COPY.home.allDisciplines, ...new Set(found)]
  }, [papers])

  const filtered = papers.filter((p) => {
    const matchesDiscipline = discipline === COPY.home.allDisciplines || p.discipline === discipline
    const q = query.trim().toLowerCase()
    const matchesQuery =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.abstract.toLowerCase().includes(q) ||
      p.authors.some((a) => a.toLowerCase().includes(q))
    return matchesDiscipline && matchesQuery
  })

  return (
    <main>
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute top-0 right-0 h-[600px] w-[600px] translate-x-[30%] -translate-y-[30%] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #2F5BFF 0%, transparent 70%)' }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-[30%] translate-y-[30%] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #10B981 0%, transparent 70%)' }}
          aria-hidden
        />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 pt-16 pb-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pt-24 lg:pb-20">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {COPY.home.badge}
            </div>

            <h1 className="mb-4 font-display text-[clamp(2.25rem,5vw,4rem)] leading-tight font-semibold text-foreground">
              {COPY.home.heroHeadline} <span className="text-primary">{COPY.home.heroPrice}</span>
              <span className="block">{COPY.home.heroSubtitle}</span>
            </h1>

            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">{COPY.home.heroDescription}</p>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-3 shadow-[var(--shadow-card)]">
                <div>
                  <p className="text-sm font-medium text-subtle line-through">{COPY.home.priceOriginal}</p>
                  <p className="text-xs text-muted-foreground">{COPY.home.priceOriginalNote}</p>
                </div>
                <svg className="flex-shrink-0" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                  <path d="M5 10h10M12 7l3 3-3 3" stroke="#2F5BFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <p className="font-display text-lg font-semibold text-success">{COPY.home.pricePaper}</p>
                  <p className="text-xs text-muted-foreground">{COPY.home.pricePaperNote}</p>
                </div>
              </div>
              <HeroStats />
            </div>
          </div>

          <div className="animate-fade-in lg:pl-6">
            <HeroPreview />
          </div>
        </div>
      </section>

      <section className="sticky top-16 z-20 border-b border-border bg-background/95 px-4 py-4 backdrop-blur-sm sm:px-6">
        <div className="mx-auto max-w-7xl space-y-3">
          <div className="relative">
            <svg className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <circle cx="8" cy="8" r="5.5" stroke="#94A3B8" strokeWidth="1.5" />
              <path d="M12 12l3 3" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={COPY.home.searchPlaceholder}
              aria-label={COPY.home.searchPlaceholder}
              className="min-h-[48px] w-full rounded-xl border-[1.5px] border-border bg-card py-3 pr-4 pl-11 text-sm text-foreground transition-colors outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {disciplines.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDiscipline(d)}
                aria-pressed={discipline === d}
                className={`min-h-[36px] rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  discipline === d
                    ? 'border-primary bg-primary text-white'
                    : 'border-border bg-card text-muted-foreground hover:border-border-strong'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-baseline justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">{COPY.home.papersTitle}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{COPY.home.papersSubtitle}</p>
          </div>
          {!loading && !loadError && (
            <span className="text-sm text-muted-foreground">
              {filtered.length} artículo{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : loadError ? (
          <div className="py-24 text-center">
            <p className="mb-6 font-display text-lg text-muted-foreground">{COPY.home.loadError}</p>
            <button
              type="button"
              onClick={() => setAttempt((n) => n + 1)}
              className="min-h-[44px] rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            >
              {COPY.home.retry}
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-24 text-center font-display text-lg text-muted-foreground">{COPY.home.noResults}</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((paper, i) => (
              <div key={paper.id} className="animate-fade-in" style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}>
                <PaperCard paper={paper} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-foreground py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="mb-2 text-center font-display text-3xl font-semibold text-white">{COPY.home.howItWorksTitle}</h2>
          <p className="mb-14 text-center text-subtle">{COPY.home.howItWorksSubtitle}</p>

          <ol className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {COPY.home.howItWorksSteps.map((step) => (
              <li key={step.number}>
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
                  <span className="font-mono text-lg font-semibold text-primary">{step.number}</span>
                </div>
                <h3 className="mb-3 font-display text-xl font-semibold text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed text-subtle">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <footer className="border-t border-border px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>{COPY.home.footerLeft}</p>
          <p>{COPY.home.footerRight}</p>
        </div>
      </footer>
    </main>
  )
}
