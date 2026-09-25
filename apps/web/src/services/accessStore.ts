import type { TxReceipt } from '@/lib/types'

// Acceso comprado: token de 24 h + recibo, guardado por artículo en el navegador.
export interface StoredAccess {
  accessToken: string
  receipt: TxReceipt
}

const KEY_PREFIX = 'paperpay:access:'

export function readAccess(paperId: string): StoredAccess | null {
  try {
    const raw = window.localStorage.getItem(KEY_PREFIX + paperId)
    return raw ? (JSON.parse(raw) as StoredAccess) : null
  } catch {
    return null
  }
}

export function writeAccess(paperId: string, access: StoredAccess): void {
  try {
    window.localStorage.setItem(KEY_PREFIX + paperId, JSON.stringify(access))
  } catch {
    // Sin almacenamiento (modo privado): el acceso dura solo esta visita.
  }
}

export function clearAccess(paperId: string): void {
  try {
    window.localStorage.removeItem(KEY_PREFIX + paperId)
  } catch {
    // Nada que limpiar.
  }
}

export function isAccessValid(access: StoredAccess): boolean {
  return new Date(access.receipt.validUntil) > new Date()
}

// Artículos con acceso vigente en este navegador, para marcarlos en el listado.
// Devuelve paperId → fecha de expiración (ISO).
export function listActiveAccess(): Map<string, string> {
  const active = new Map<string, string>()
  try {
    const storage = window.localStorage
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      if (!key?.startsWith(KEY_PREFIX)) continue
      const access = readAccess(key.slice(KEY_PREFIX.length))
      if (access && isAccessValid(access)) active.set(key.slice(KEY_PREFIX.length), access.receipt.validUntil)
    }
  } catch {
    // Sin almacenamiento: nada comprado que mostrar.
  }
  return active
}
