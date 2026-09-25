import { UsdcChip } from './UsdcChip'

// Vista de producto para el hero: un artículo con paywall y botón de desbloqueo.
// Puro HTML/CSS temeable (sin imágenes externas), para dar fuerza visual sin peso.
export function HeroPreview() {
  return (
    <div className="relative">
      {/* halo suave detrás */}
      <div
        className="pointer-events-none absolute -inset-6 rounded-[32px] opacity-60"
        style={{ background: 'radial-gradient(60% 60% at 50% 30%, rgba(47,91,255,0.16), transparent 70%)' }}
        aria-hidden
      />

      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-elevated)]">
        {/* barra tipo navegador */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#E8E4DC]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#E8E4DC]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#E8E4DC]" />
          <span className="ml-3 truncate rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground">paperpay.press/papers/…</span>
        </div>

        <div className="relative px-7 pt-7 pb-9">
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded-full bg-[#EEF2FF] px-2.5 py-1 text-xs font-semibold text-[#4338CA]">Informática</span>
            <UsdcChip size="sm" />
          </div>

          <h3 className="mb-2 font-display text-2xl leading-snug font-semibold text-foreground">
            Pagos Autónomos entre Agentes: HTTP&nbsp;402 sobre Stellar
          </h3>
          <p className="mb-5 text-sm text-muted-foreground">Dra. Elena Ramos, Dr. Carlos V. Mendoza</p>

          <div className="space-y-2.5">
            <span className="block h-3 w-full rounded bg-[#ECEAE2]" />
            <span className="block h-3 w-[92%] rounded bg-[#ECEAE2]" />
            <span className="block h-3 w-[97%] rounded bg-[#ECEAE2]" />
          </div>

          {/* zona difuminada + CTA */}
          <div className="relative mt-3">
            <div className="space-y-2.5 blur-[3px]" aria-hidden>
              <span className="block h-3 w-full rounded bg-[#ECEAE2]" />
              <span className="block h-3 w-[88%] rounded bg-[#ECEAE2]" />
              <span className="block h-3 w-[95%] rounded bg-[#ECEAE2]" />
              <span className="block h-3 w-[80%] rounded bg-[#ECEAE2]" />
            </div>
            <div className="absolute inset-x-0 bottom-0 flex justify-center pt-8" style={{ background: 'linear-gradient(to bottom, transparent, var(--color-card) 65%)' }}>
              <span className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-card)]">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <rect x="2.5" y="7" width="11" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M5.5 7V5.5a2.5 2.5 0 015 0V7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                Leer por $0.50 USDC
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* etiqueta flotante de confianza */}
      <div className="absolute -right-3 -bottom-4 hidden items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-[var(--shadow-elevated)] sm:flex">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success-bg">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M3 7l3 3 5-5" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="text-xs font-semibold text-foreground">Liquidado en ~5 s</span>
      </div>
    </div>
  )
}
