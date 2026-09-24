'use client'

import { useEffect, useRef } from 'react'
import { COPY } from '@/lib/copy'
import { CheckIcon } from './PaywallCard'

interface Props {
  onConnect: () => void
  onClose: () => void
}

export function ConnectWalletModal({ onConnect, onClose }: Props) {
  const connectRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    connectRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wallet-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative w-full max-w-md animate-slide-up rounded-2xl bg-card p-8 shadow-[var(--shadow-elevated)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
          aria-label={COPY.wallet.close}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-usdc-bg">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
            <rect x="4" y="8" width="20" height="14" rx="3" stroke="#2775CA" strokeWidth="2" />
            <path d="M4 13h20" stroke="#2775CA" strokeWidth="2" />
            <circle cx="20" cy="18" r="2" fill="#2775CA" />
          </svg>
        </div>

        <h2 id="wallet-modal-title" className="mb-2 font-display text-xl font-semibold text-foreground">
          {COPY.wallet.modalTitle}
        </h2>
        <p className="mb-8 text-sm leading-relaxed text-muted-foreground">{COPY.wallet.modalSubtitle}</p>

        <ul className="mb-8 space-y-2">
          {COPY.wallet.trust.map((item) => (
            <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <CheckIcon />
              {item}
            </li>
          ))}
        </ul>

        <button
          ref={connectRef}
          type="button"
          onClick={onConnect}
          className="min-h-[44px] w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          {COPY.wallet.connectButton}
        </button>
      </div>
    </div>
  )
}
