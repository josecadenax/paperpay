'use client'

import { useEffect, useState } from 'react'
import { COPY } from '@/lib/copy'

interface Props {
  message: string
  onDismiss: () => void
  duration?: number
}

export function Toast({ message, onDismiss, duration = 4000 }: Props) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const hide = setTimeout(() => setVisible(false), duration)
    return () => clearTimeout(hide)
  }, [duration])

  useEffect(() => {
    if (visible) return
    const remove = setTimeout(onDismiss, 300)
    return () => clearTimeout(remove)
  }, [visible, onDismiss])

  return (
    <div
      className="fixed bottom-6 left-1/2 z-50 w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
      role="status"
      aria-live="polite"
    >
      <div className="flex animate-toast-in items-center gap-3 rounded-2xl bg-foreground px-5 py-3.5 text-sm font-semibold text-white shadow-[0_8px_32px_rgba(15,23,42,0.25)]">
        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-success">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        {message}
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="ml-1 flex-shrink-0 opacity-60 transition-opacity hover:opacity-100"
          aria-label={COPY.toast.dismiss}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
