import { COPY } from '@/lib/copy'

const ICONS = [
  // Sin cuenta (llave)
  <svg key="k" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="8" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
    <path d="M11.5 12H21l-2 2 2 2M16 12v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
  // Verificable (escudo con check)
  <svg key="s" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M8.5 12l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
  // Rápido (rayo)
  <svg key="l" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>,
]

export function TrustStrip() {
  return (
    <section className="border-y border-border bg-card/60">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6">
        {COPY.home.trust.map((seal, i) => (
          <div key={seal.title} className="flex items-start gap-4">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              {ICONS[i]}
            </span>
            <div>
              <h3 className="font-display text-base font-semibold text-foreground">{seal.title}</h3>
              <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{seal.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
