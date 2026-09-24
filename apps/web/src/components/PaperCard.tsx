import Link from 'next/link'
import { COPY } from '@/lib/copy'
import { formatLongDate } from '@/lib/format'
import type { PaperPreview } from '@/lib/types'
import { DisciplineChip } from './DisciplineChip'
import { UsdcChip } from './UsdcChip'

export function PaperCard({ paper }: { paper: PaperPreview }) {
  const extraAuthors = paper.authors.length - 2

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]">
      <div className="px-5 pt-5 pb-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          {paper.discipline ? <DisciplineChip discipline={paper.discipline} /> : <span />}
          <UsdcChip size="sm" />
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
        <span className="truncate font-mono text-xs text-muted-foreground">
          {paper.doi ? `DOI: ${paper.doi}` : paper.publisher}
        </span>
        <Link
          href={`/papers/${paper.id}`}
          className="inline-flex min-h-[44px] flex-shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          {COPY.home.readFor} $0.50
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </article>
  )
}
