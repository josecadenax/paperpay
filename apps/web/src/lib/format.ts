export function formatLongDate(iso: string): string {
  return new Intl.DateTimeFormat('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }).format(
    new Date(`${iso.slice(0, 10)}T12:00:00`),
  )
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(iso))
}

export function shortHash(hash: string, size = 8): string {
  return hash.length <= size * 2 ? hash : `${hash.slice(0, size)}...${hash.slice(-size)}`
}

export function formatShortDateTime(iso: string): string {
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(
    new Date(iso),
  )
}
