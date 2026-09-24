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
