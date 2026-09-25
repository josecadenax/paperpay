import Link from 'next/link'
import { COPY } from '@/lib/copy'
import { formatLongDate, formatShortDateTime } from '@/lib/format'
import type { PaperPreview } from '@/lib/types'
import { DisciplineChip } from './DisciplineChip'
import { DisciplineCover } from './DisciplineCover'
import { UsdcChip } from './UsdcChip'

interface Props {
  paper: PaperPreview
  // Expiración (ISO) del acceso comprado en este navegador; ausente si no se ha comprado.
  accessUntil?: string
}

export function PaperCard({ paper, accessUntil }: Props) {
  const extraAuthors = paper.authors.length - 2
  const purchased = accessUntil !== undefined

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] ${
        purchased ? 'border-success/40 ring-1 ring-success/20' : 'border-border'
      }`}
    >
      <Link href={`/papers/${paper.id}`} className="relative block h-28 overflow-hidden">
        <DisciplineCover discipline={paper.discipline} className="h-full w-full transition-transform duration-300 group-hover:scale-105" />
        <span className="absolute top-3 right-3">
          {purchased ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-2 py-0.5 text-xs font-semibold text-success-strong">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <circle cx="6" cy="6" r="5" stroke="#10B981" strokeWidth="1.2" />
                <path d="M3.5 6l2 2 3-3" stroke="#10B981" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {COPY.home.purchased}
            </span>
          ) : (
            <UsdcChip size="sm" />
          )}
        </span>
      </Link>

      <div className="px-5 pt-4 pb-4">
        <div className="mb-3">
          {paper.discipline ? <DisciplineChip discipline={paper.discipline} /> : <span />}
        </div>

        <h3 className="mb-3 line-clamp-2 font-display text-base font-semibold leading-snug text-foreground">
          {paper.title}
        </h3>

        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{paper.abstract}</p>

        <div className="space-y-1 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">
            {paper.authors.slice(0, 2).join(', ')}
            {extraAuthors > 0 && ` +${extraAuthors}`}
          </p>
          <p>
            {paper.publisher} · {formatLongDate(paper.publishedDate)}
          </p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border px-5 py-4">
        {purchased ? (
          <span className="truncate text-xs font-medium text-success-strong">
            {COPY.home.accessUntil} {formatShortDateTime(accessUntil)}
          </span>
        ) : (
          <span className="truncate font-mono text-xs text-muted-foreground">
            {paper.doi ? `DOI: ${paper.doi}` : paper.publisher}
          </span>
        )}
        <Link
          href={`/papers/${paper.id}`}
          className={`inline-flex min-h-[44px] flex-shrink-0 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold transition-colors ${
            purchased
              ? 'bg-success-bg text-success-strong hover:bg-success/20'
              : 'bg-primary text-primary-foreground hover:bg-primary-hover'
          }`}
        >
          {purchased ? COPY.home.readNow : `${COPY.home.readFor} $0.50`}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </article>
  )
}
