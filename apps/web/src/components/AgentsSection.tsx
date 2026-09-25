import { COPY } from '@/lib/copy'

export function AgentsSection() {
  const { agents } = COPY.home
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="grid grid-cols-1 items-center gap-10 rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-card)] lg:grid-cols-[1fr_0.9fr] lg:p-12">
        <div>
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            {agents.badge}
          </span>
          <h2 className="mb-4 font-display text-3xl font-semibold text-foreground">{agents.title}</h2>
          <p className="mb-6 text-lg leading-relaxed text-muted-foreground">{agents.description}</p>
          <ul className="space-y-3">
            {agents.points.map((point) => (
              <li key={point} className="flex items-center gap-3 text-sm text-foreground">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-success-bg">
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d="M3 7l3 3 5-5" stroke="#10B981" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="overflow-hidden rounded-2xl bg-foreground p-5 font-mono text-[13px] leading-relaxed text-[#E2E8F0]">
          <div className="mb-3 flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#334155]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#334155]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#334155]" />
          </div>
          <pre className="overflow-x-auto whitespace-pre">
            <span className="text-[#64748B]"># El agente pide el artículo</span>
            {'\n'}GET /api/papers/:id{'\n'}
            <span className="text-[#F59E0B]">→ 402 Payment Required</span>{'\n\n'}
            <span className="text-[#64748B]"># Firma y reintenta con el pago</span>{'\n'}GET /api/papers/:id{'\n'}
            <span className="text-[#94A3B8]">  payment-signature: …</span>{'\n'}
            <span className="text-[#10B981]">→ 200 OK · contenido + recibo</span>
          </pre>
        </div>
      </div>
    </section>
  )
}
