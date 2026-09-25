'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { ConnectWalletModal } from '@/components/ConnectWalletModal'
import { DebugPanel } from '@/components/DebugPanel'
import { DisciplineChip } from '@/components/DisciplineChip'
import { MarkdownContent } from '@/components/MarkdownContent'
import { PaywallBarMobile, PaywallCard } from '@/components/PaywallCard'
import { Toast } from '@/components/Toast'
import { UsdcChip } from '@/components/UsdcChip'
import { usePaywall } from '@/hooks/usePaywall'
import { COPY } from '@/lib/copy'
import { formatLongDate } from '@/lib/format'
import type { PaperPreview } from '@/lib/types'
import { getPaper, isSimulatedTx } from '@/services/paperpay'

// El snippet del backend empieza con el título de la sección ("1. Introduction") en su propia línea.
function PreviewSnippet({ text }: { text: string }) {
  const [first, ...rest] = text.split('\n')
  const hasHeading = rest.length > 0 && first.length < 80 && !first.trim().endsWith('.')
  const paragraphs = (hasHeading ? rest : [first, ...rest]).filter((line) => line.trim())

  return (
    <div className="prose-paper">
      {hasHeading && <h2>{first}</h2>}
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  )
}

export function ArticleView({ paperId }: { paperId: string }) {
  const [preview, setPreview] = useState<PaperPreview | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [debug, setDebug] = useState(false)

  const { state, errorCode, paper, receipt, startPayment, retry, unlock, fail, forceState } = usePaywall(paperId)

  useEffect(() => {
    setDebug(process.env.NODE_ENV === 'development' && new URLSearchParams(window.location.search).get('debug') === '1')
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError(false)
    getPaper(paperId)
      .then((result) => {
        if (cancelled) return
        if (result.status === 'unlocked') {
          setPreview(result.paper)
          unlock(result.paper, result.receipt)
        } else {
          setPreview(result.preview)
          if (result.expired) fail('EXPIRED')
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return
        if (err instanceof Error && err.message === 'PAPER_NOT_FOUND') setNotFound(true)
        else setLoadError(true)
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [paperId, unlock, fail, attempt])

  const handleConnect = async () => {
    setShowModal(false)
    await startPayment()
    setShowToast(true)
  }

  const dismissToast = useCallback(() => setShowToast(false), [])

  if (notFound) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <p className="mb-6 font-display text-2xl text-foreground">{COPY.paper.notFound}</p>
        <Link href="/" className="font-semibold text-primary hover:underline">
          {COPY.paper.backHome}
        </Link>
      </main>
    )
  }

  if (loadError) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <p className="mb-6 font-display text-2xl text-foreground">{COPY.paper.loadError}</p>
        <button
          type="button"
          onClick={() => setAttempt((n) => n + 1)}
          className="min-h-[44px] rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          {COPY.paper.retry}
        </button>
      </main>
    )
  }

  if (loading || !preview) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded-lg bg-muted" />
            <div className="h-6 w-1/2 animate-pulse rounded-lg bg-muted" />
            <div className="mt-8 h-48 animate-pulse rounded-xl bg-muted" />
          </div>
          <div className="h-72 animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    )
  }

  const isUnlocked = state === 'unlocked' && paper !== null
  const cardProps = {
    state,
    errorCode,
    receipt,
    simulated: receipt ? isSimulatedTx(receipt.txHash) : true,
    onPay: () => setShowModal(true),
    onRetry: retry,
  }

  return (
    <>
      {debug && <DebugPanel onForceState={forceState} onForceError={fail} />}

      <main className={`mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12 ${isUnlocked ? 'pb-12' : 'pb-64 lg:pb-12'}`}>
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_360px] lg:gap-12">
          <article className="min-w-0">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              {preview.discipline && <DisciplineChip discipline={preview.discipline} />}
              <UsdcChip />
              {isUnlocked && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-3 py-1 text-xs font-semibold text-success-strong">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <circle cx="6" cy="6" r="5" stroke="#10B981" strokeWidth="1.2" />
                    <path d="M3.5 6l2 2 3-3" stroke="#10B981" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {COPY.paper.activeAccess}
                </span>
              )}
            </div>

            <h1 className="mb-5 font-display text-[clamp(1.5rem,3vw,2.25rem)] leading-tight font-semibold text-foreground">
              {preview.title}
            </h1>

            <div className="mb-6 space-y-2 border-b border-border pb-6 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">{COPY.paper.by}: </span>
                {preview.authors.join(', ')}
              </p>
              <p>
                <span className="font-medium text-foreground">{COPY.paper.publishedIn}: </span>
                {preview.publisher} · {formatLongDate(preview.publishedDate)}
              </p>
              {preview.doi && (
                <p className="font-mono">
                  <span className="font-sans font-medium text-foreground">{COPY.paper.doi}: </span>
                  {preview.doi}
                </p>
              )}
            </div>

            <section className="mb-8">
              <h2 className="mb-3 font-display text-lg font-semibold text-foreground">{COPY.paper.abstract}</h2>
              <div className="rounded-xl border-l-[3px] border-primary bg-muted p-5 text-sm leading-relaxed text-foreground">
                {preview.abstract}
              </div>
            </section>

            {isUnlocked ? (
              <div className="prose-paper animate-unblur">
                <MarkdownContent markdown={paper.fullContentMarkdown} />

                {paper.references.length > 0 && (
                  <div className="mt-12 border-t border-border pt-8">
                    <h2>{COPY.paper.references}</h2>
                    <ol className="!list-none !pl-0">
                      {paper.references.map((ref, i) => (
                        <li key={i} className="text-sm text-muted-foreground">
                          <span className="mr-2 font-mono text-primary">[{i + 1}]</span>
                          {ref}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ) : (
              <>
                <PreviewSnippet text={preview.previewSnippet} />
                <div className="relative mt-2">
                  <div className="paywall-blurred prose-paper" aria-hidden>
                    <p>
                      La metodología empleada en este estudio combina análisis cuantitativo con validación experimental en
                      entornos controlados. Los datos obtenidos demuestran una correlación significativa entre las variables
                      primarias y los resultados esperados según el marco teórico establecido.
                    </p>
                    <p>
                      Los resultados preliminares sugieren que el enfoque propuesto supera a los métodos convencionales en
                      términos de eficiencia operacional, manteniendo márgenes de error estadísticamente aceptables.
                    </p>
                  </div>
                  <div
                    className="pointer-events-none absolute right-0 bottom-0 left-0 h-48"
                    style={{ background: 'linear-gradient(to bottom, transparent 0%, var(--color-background) 80%)' }}
                    aria-hidden
                  />
                  <div className="relative z-10 pt-4 text-center">
                    <p className="mb-1 text-sm font-medium text-muted-foreground">{COPY.paper.previewEnds}</p>
                    <p className="text-xs text-muted-foreground">{COPY.paper.unlockToRead}</p>
                  </div>
                </div>
              </>
            )}
          </article>

          <aside className={isUnlocked ? 'block' : 'hidden lg:block'}>
            <div className="lg:sticky lg:top-24">
              <PaywallCard {...cardProps} />
            </div>
          </aside>
        </div>
      </main>

      <div className="lg:hidden">
        <PaywallBarMobile {...cardProps} />
      </div>

      {showModal && <ConnectWalletModal onConnect={handleConnect} onClose={() => setShowModal(false)} />}
      {showToast && state === 'unlocked' && <Toast message={COPY.toast.unlocked} onDismiss={dismissToast} />}
    </>
  )
}
