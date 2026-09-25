'use client'

import { usePollar } from '@pollar/react'
import { shortHash } from '@/lib/format'

// Login social con Pollar (v2). Debe usarse bajo <PollarProviderGate> activo (modo pollar).
// Al entrar, Pollar crea la wallet, activa USDC y patrocina la comisión.
export function PollarConnect({ onConnected }: { onConnected?: () => void }) {
  const { isAuthenticated, wallet, login, logout } = usePollar()

  if (isAuthenticated && wallet) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success-bg px-4 py-3">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-success">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M3 8l4 4 6-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-success-strong">Wallet conectada</p>
            <p className="truncate font-mono text-xs text-success-strong/80">{shortHash(wallet.address, 6)}</p>
          </div>
        </div>
        {onConnected && (
          <button
            type="button"
            onClick={onConnected}
            className="min-h-[44px] w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Continuar
          </button>
        )}
        <button type="button" onClick={() => logout()} className="w-full text-center text-xs text-muted-foreground hover:underline">
          Cerrar sesión
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => login({ provider: 'google' })}
        className="flex min-h-[48px] w-full items-center justify-center gap-3 rounded-xl border border-border bg-card py-3 text-sm font-semibold text-foreground transition-colors hover:border-border-strong"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
          <path d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62z" fill="#4285F4" />
          <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.34A9 9 0 009 18z" fill="#34A853" />
          <path d="M3.98 10.72a5.4 5.4 0 010-3.44V4.94H.96a9 9 0 000 8.12l3.02-2.34z" fill="#FBBC05" />
          <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 00.96 4.94l3.02 2.34C4.68 5.16 6.66 3.58 9 3.58z" fill="#EA4335" />
        </svg>
        Continuar con Google
      </button>
      <button
        type="button"
        onClick={() => login({ provider: 'email' })}
        className="min-h-[44px] w-full rounded-xl bg-muted py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-border"
      >
        Continuar con correo
      </button>
      <p className="text-center text-xs text-muted-foreground">Pollar crea tu wallet y cubre la comisión de red.</p>
    </div>
  )
}
