'use client'

import { useState } from 'react'
import { COPY } from '@/lib/copy'
import { formatDateTime, shortHash } from '@/lib/format'
import type { TxReceipt } from '@/lib/types'

interface Props {
  receipt: TxReceipt
  simulated?: boolean
}

export function TxReceiptCard({ receipt, simulated = false }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(receipt.txHash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // El navegador bloqueó el portapapeles; el hash sigue visible.
    }
  }

  return (
    <div className="animate-fade-in overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3 border-b border-border bg-success-bg px-5 py-4">
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-success">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M3 8l4 4 6-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div>
          <p className="text-sm font-semibold text-success-strong">{COPY.receipt.title}</p>
          <p className="text-xs text-[#047857]">{COPY.receipt.confirmed}</p>
        </div>
      </div>

      <dl className="divide-y divide-border">
        <ReceiptRow label={COPY.receipt.amount} value={`$${receipt.amount.toFixed(2)} USDC`} />
        <ReceiptRow label={COPY.receipt.date} value={formatDateTime(receipt.date)} />
        <ReceiptRow label={COPY.receipt.validUntil} value={formatDateTime(receipt.validUntil)} />
        <div className="flex items-center justify-between gap-4 px-5 py-3.5">
          <dt className="text-xs font-medium text-muted-foreground">{COPY.receipt.txHash}</dt>
          <dd className="flex items-center gap-2">
            <span className="font-mono text-xs text-foreground" title={receipt.txHash}>
              {shortHash(receipt.txHash)}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              aria-label={COPY.receipt.copyLabel}
              className={`min-h-[32px] rounded-lg px-2 py-1 text-xs font-semibold transition-colors ${
                copied ? 'bg-success-bg text-success-strong' : 'bg-muted text-muted-foreground hover:bg-border'
              }`}
            >
              {copied ? COPY.receipt.copied : COPY.receipt.copy}
            </button>
          </dd>
        </div>
      </dl>

      <div className="px-5 py-4">
        {simulated ? (
          <p className="rounded-xl bg-muted px-4 py-3 text-center text-xs text-muted-foreground">{COPY.receipt.demoNote}</p>
        ) : (
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${receipt.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-muted py-3 text-sm font-semibold text-foreground transition-colors hover:bg-border"
          >
            {COPY.receipt.explorer}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M3 3h8v8M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        )}
      </div>
    </div>
  )
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-semibold text-foreground">{value}</dd>
    </div>
  )
}
