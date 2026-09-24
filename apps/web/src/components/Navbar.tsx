'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { COPY } from '@/lib/copy'

export function Navbar() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const isEditorial = pathname === '/editorial'

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 px-4 backdrop-blur-md sm:px-6">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-primary">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M3 3h10M3 6h7M3 9h9M3 12h5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
          <span className="font-display text-lg font-semibold leading-none text-foreground">{COPY.brand.name}</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {!isHome && (
            <Link
              href="/"
              className="hidden min-h-[44px] items-center rounded-lg px-3 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted sm:flex"
            >
              {COPY.nav.back}
            </Link>
          )}
          <Link
            href="/editorial"
            aria-current={isEditorial ? 'page' : undefined}
            className={`flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium whitespace-nowrap transition-colors ${
              isEditorial ? 'bg-primary-soft text-primary' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {COPY.nav.editorial}
          </Link>
        </nav>
      </div>
    </header>
  )
}
