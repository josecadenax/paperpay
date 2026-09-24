import { COPY } from '@/lib/copy'
import type { PaywallErrorCode, PaywallState, TxReceipt } from '@/lib/types'
import { ErrorAlert } from './ErrorAlert'
import { PaymentStepper } from './PaymentStepper'
import { TxReceiptCard } from './TxReceipt'
import { UsdcChip } from './UsdcChip'

interface Props {
  state: PaywallState
  errorCode: PaywallErrorCode | null
  receipt: TxReceipt | null
  simulated: boolean
  onPay: () => void
  onRetry: () => void
}

const isProcessing = (state: PaywallState) =>
  state === 'connecting' || state === 'awaitingSignature' || state === 'settling'

function LockIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="2.5" y="7" width="11" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5.5 7V5.5a2.5 2.5 0 015 0V7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function PayButton({ onPay }: { onPay: () => void }) {
  return (
    <button
      type="button"
      onClick={onPay}
      className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
    >
      <LockIcon />
      {COPY.paywall.ctaButton}
    </button>
  )
}

export function PaywallCard({ state, errorCode, receipt, simulated, onPay, onRetry }: Props) {
  if (state === 'unlocked' && receipt) return <TxReceiptCard receipt={receipt} simulated={simulated} />

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-elevated)]">
      <div className="border-b border-border px-6 py-5">
        <div className="mb-1 flex items-center justify-between">
          <div className="flex items-center gap-2 text-foreground">
            <LockIcon size={20} />
            <span className="text-sm font-semibold">{COPY.paywall.locked}</span>
          </div>
          <UsdcChip />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{COPY.paywall.accessLabel}</p>
      </div>

      <div className="space-y-4 px-6 py-5">
        {state === 'error' && errorCode ? (
          <ErrorAlert code={errorCode} onAction={onRetry} />
        ) : isProcessing(state) ? (
          <PaymentStepper state={state} />
        ) : (
          <>
            <div className="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
              <div>
                <p className="font-display text-2xl font-semibold text-foreground">{COPY.paywall.price}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{COPY.paywall.priceBreakdown}</p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p className="text-sm font-medium text-subtle line-through">{COPY.paywall.publisherPrice}</p>
                <p>{COPY.paywall.publisherPriceNote}</p>
              </div>
            </div>

            <ul className="space-y-1.5">
              {COPY.paywall.trust.map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>

            <PayButton onPay={onPay} />
            <p className="text-center text-xs text-muted-foreground">{COPY.paywall.microcopy}</p>
          </>
        )}
      </div>
    </div>
  )
}

export function PaywallBarMobile({ state, errorCode, onPay, onRetry }: Props) {
  if (state === 'unlocked') return null

  return (
    <div className="fixed right-0 bottom-0 left-0 z-40 border-t border-border bg-card px-4 pt-4 pb-6 shadow-[var(--shadow-paywall)]">
      {state === 'error' && errorCode ? (
        <ErrorAlert code={errorCode} onAction={onRetry} />
      ) : isProcessing(state) ? (
        <PaymentStepper state={state} />
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <UsdcChip />
              <span className="text-sm font-semibold text-foreground">{COPY.paywall.accessLabel}</span>
            </div>
          </div>
          <PayButton onPay={onPay} />
          <p className="text-center text-xs text-muted-foreground">{COPY.paywall.microcopy}</p>
        </div>
      )}
    </div>
  )
}

export function CheckIcon() {
  return (
    <svg className="flex-shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="6" stroke="#10B981" strokeWidth="1.2" />
      <path d="M4.5 7l2 2 3-3" stroke="#10B981" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
