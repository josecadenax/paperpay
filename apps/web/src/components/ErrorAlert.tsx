import { COPY } from '@/lib/copy'
import type { PaywallErrorCode } from '@/lib/types'

// Errores cuya solución está fuera de PaperPay: el botón abre la ayuda y deja reintentar.
const HELP_LINKS: Partial<Record<PaywallErrorCode, string>> = {
  NO_WALLET: 'https://www.freighter.app',
  INSUFFICIENT_FUNDS: 'https://faucet.circle.com',
}

interface Props {
  code: PaywallErrorCode
  onAction: () => void
}

export function ErrorAlert({ code, onAction }: Props) {
  const info = COPY.errors[code]
  const href = HELP_LINKS[code]
  const buttonClass =
    'flex min-h-[44px] w-full items-center justify-center rounded-lg bg-error py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#DC2626]'

  return (
    <div className="animate-fade-in overflow-hidden rounded-xl border border-[#FECACA] bg-error-bg" role="alert">
      <div className="flex items-start gap-3 px-4 py-4">
        <svg className="mt-0.5 flex-shrink-0" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
          <circle cx="9" cy="9" r="8" stroke="#EF4444" strokeWidth="1.5" />
          <path d="M9 5.5v4" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="9" cy="12.5" r="0.75" fill="#EF4444" />
        </svg>
        <div className="min-w-0 flex-1">
          <p className="mb-0.5 text-sm font-semibold text-[#B91C1C]">{info.title}</p>
          <p className="text-xs leading-relaxed text-[#B91C1C]">{info.description}</p>
          {code === 'WRONG_NETWORK' && (
            <p className="mt-2 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2 text-xs font-medium text-[#92400E]">
              {COPY.wallet.wrongNetworkPath}
            </p>
          )}
        </div>
      </div>
      <div className="px-4 pb-4">
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" onClick={onAction} className={buttonClass}>
            {info.action}
          </a>
        ) : (
          <button type="button" onClick={onAction} className={buttonClass}>
            {info.action}
          </button>
        )}
      </div>
    </div>
  )
}
