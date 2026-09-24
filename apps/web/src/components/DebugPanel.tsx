import { COPY } from '@/lib/copy'
import type { PaywallErrorCode, PaywallState } from '@/lib/types'

interface Props {
  onForceState: (state: PaywallState) => void
  onForceError: (code: PaywallErrorCode) => void
}

const STATES: PaywallState[] = ['locked', 'connecting', 'awaitingSignature', 'settling', 'unlocked']
const ERRORS: PaywallErrorCode[] = ['NO_WALLET', 'WRONG_NETWORK', 'INSUFFICIENT_FUNDS', 'NO_TRUSTLINE', 'USER_REJECTED', 'EXPIRED', 'PAYMENT_FAILED']

export function DebugPanel({ onForceState, onForceError }: Props) {
  return (
    <div className="fixed top-20 right-4 z-[100] w-60 space-y-3 rounded-xl border border-[#334155] bg-foreground p-4 font-mono text-xs text-[#E2E8F0] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      <p className="text-xs font-semibold tracking-wider text-yellow-400 uppercase">{COPY.debug.title}</p>
      <div>
        <p className="mb-1.5 text-[#94A3B8]">{COPY.debug.forceState}</p>
        <div className="flex flex-wrap gap-1.5">
          {STATES.map((s) => (
            <button key={s} type="button" onClick={() => onForceState(s)} className="rounded bg-[#1E293B] px-2 py-1 text-[#94A3B8] hover:bg-[#334155]">
              {s}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-[#94A3B8]">{COPY.debug.forceError}</p>
        <div className="flex flex-wrap gap-1.5">
          {ERRORS.map((e) => (
            <button key={e} type="button" onClick={() => onForceError(e)} className="rounded bg-[#450A0A] px-2 py-1 text-[#FCA5A5] hover:bg-[#7F1D1D]">
              {e}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
