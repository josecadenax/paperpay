'use client'

import { useEffect, useRef, useState } from 'react'
import { usePollarCheckout } from '@/hooks/usePollarCheckout'
import { COPY } from '@/lib/copy'
import type { PaperFull, PaywallErrorCode, PaywallState, TxReceipt } from '@/lib/types'
import { getPaymentTerms, persistVerifiedAccess } from '@/services/apiBackend'
import { CheckIcon } from './PaywallCard'
import { PollarConnect } from './PollarConnect'

interface Props {
  paperId: string
  onClose: () => void
  onState: (state: PaywallState) => void
  onUnlocked: (paper: PaperFull, receipt: TxReceipt) => void
  onError: (code: PaywallErrorCode) => void
}

function errorCodeFor(message: string): PaywallErrorCode {
  // Falta de XLM para la comisión de red (no de USDC). En producción Pollar debería
  // patrocinar el fee; si no está activo, esto sale con una wallet nueva sin XLM.
  if (/network fee|insufficient xlm|\bxlm\b|comisi[óo]n de red|TX_INSUFFICIENT_FEE/i.test(message)) return 'PAYMENT_FAILED'
  if (/trustline|l[ií]nea de confianza/i.test(message)) return 'NO_TRUSTLINE'
  if (/insufficient|saldo|fondos|balance/i.test(message)) return 'INSUFFICIENT_FUNDS'
  if (/reject|cancel|denied|deneg/i.test(message)) return 'USER_REJECTED'
  return 'PAYMENT_FAILED'
}

// Modal de pago con Pollar (v2). Solo se monta en modo pollar (provider activo).
// Login social → runTx paga 0.50 USDC a la tesorería → el backend verifica por hash.
export function PollarPaymentModal({ paperId, onClose, onState, onUnlocked, onError }: Props) {
  const { isAuthenticated, address, pay } = usePollarCheckout(paperId)
  const [busy, setBusy] = useState(false)
  const payRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, busy])

  useEffect(() => {
    if (isAuthenticated) payRef.current?.focus()
  }, [isAuthenticated])

  const handlePay = async () => {
    setBusy(true)
    onState('settling')
    try {
      const terms = await getPaymentTerms(paperId)
      const result = await pay(terms)
      const receipt = persistVerifiedAccess(paperId, result, terms.amount)
      onUnlocked(result.paper, receipt)
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      // Si Pollar disparó el login (sesión perdida), dejamos el modal abierto para reintentar.
      if (message === 'POLLAR_LOGIN_REQUIRED') {
        onState('locked')
        setBusy(false)
        return
      }
      onError(errorCodeFor(message))
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pollar-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose()
      }}
    >
      <div className="relative w-full max-w-md animate-slide-up rounded-2xl bg-card p-8 shadow-[var(--shadow-elevated)]">
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
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

        <h2 id="pollar-modal-title" className="mb-2 font-display text-xl font-semibold text-foreground">
          Paga 0.50 USDC para leer
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          Entra con tu cuenta y paga con USDC. Pollar crea tu wallet y cubre la comisión de red. Sin extensiones ni frases
          semilla.
        </p>

        {!isAuthenticated ? (
          <PollarConnect />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
              <CheckIcon />
              <span className="min-w-0">
                Wallet lista{address ? <span className="font-mono"> · {address.slice(0, 4)}…{address.slice(-4)}</span> : null}
              </span>
            </div>
            <button
              ref={payRef}
              type="button"
              onClick={handlePay}
              disabled={busy}
              className="min-h-[44px] w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
            >
              {busy ? 'Procesando pago…' : 'Pagar 0.50 USDC'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
