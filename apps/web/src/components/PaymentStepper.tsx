import { COPY } from '@/lib/copy'
import type { PaywallState } from '@/lib/types'

const STEPS = ['awaitingSignature', 'settling', 'unlocked'] as const

function stepIndex(state: PaywallState): number {
  if (state === 'settling') return 1
  if (state === 'unlocked') return 2
  return 0
}

export function PaymentStepper({ state }: { state: PaywallState }) {
  const current = stepIndex(state)

  return (
    <div className="animate-slide-up" aria-live="polite">
      <div className="mb-5 flex items-center justify-center gap-2 rounded-xl bg-success-bg py-2 text-xs font-semibold text-success-strong">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M7 1L2 3v4c0 3.3 2.2 5.8 5 6 2.8-.2 5-2.7 5-6V3L7 1z" stroke="#10B981" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M4.5 7l2 2 3-3" stroke="#10B981" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {COPY.stepper.guarantee}
      </div>

      <ol className="space-y-3">
        {STEPS.map((step, i) => {
          const info = COPY.stepper.steps[step]
          const isDone = i < current
          const isActive = i === current
          const isPending = i > current

          return (
            <li
              key={step}
              aria-current={isActive ? 'step' : undefined}
              className={`flex items-start gap-4 rounded-xl border p-4 transition-all duration-300 ${
                isActive
                  ? 'border-[#BFDBFE] bg-usdc-bg'
                  : isPending
                    ? 'border-border bg-transparent'
                    : 'border-[#A7F3D0] bg-success-bg'
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {isDone ? (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-success">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <path d="M3 7l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                ) : isActive ? (
                  <div
                    className="h-7 w-7 animate-spin-slow rounded-full border-[2.5px] border-primary border-t-transparent"
                    role="status"
                    aria-label={COPY.stepper.processing}
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted font-mono text-xs font-semibold text-muted-foreground">
                    {i + 1}
                  </div>
                )}
              </div>

              <div>
                <p className={`mb-1 text-sm font-semibold leading-none ${isPending ? 'text-muted-foreground' : 'text-foreground'}`}>
                  {info.label}
                </p>
                {!isPending && <p className="text-xs leading-relaxed text-muted-foreground">{info.description}</p>}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
