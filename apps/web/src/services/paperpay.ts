import { ACCESS_TOKEN_EXPIRATION_HOURS, DEFAULT_PAPER_PRICE_USDC } from '@paperpay/shared'
import type { PaperFull, PaperPreview, TxReceipt } from '@/lib/types'
import { MOCK_PAPERS } from '@/mocks/catalog'

/*
 * Capa de datos del frontend. Hoy todo se simula en el navegador porque el backend
 * aún no liquida pagos reales. Cuando esté listo (#18), solo cambia este archivo:
 *   getPapers   -> GET /api/papers
 *   getPaper    -> GET /api/papers/:id (+ Authorization: Bearer <accessToken> si existe)
 *   payForPaper -> firmar con Freighter y reintentar con PAYMENT-SIGNATURE
 * Las pantallas y el hook usePaywall no deberían cambiar.
 */

const ACCESS_KEY_PREFIX = 'paperpay:access:'

interface StoredAccess {
  accessToken: string
  receipt: TxReceipt
}

export type PaperResult =
  | { status: 'locked'; preview: PaperPreview; expired: boolean }
  | { status: 'unlocked'; paper: PaperFull; receipt: TxReceipt }

export interface PaymentResult {
  paper: PaperFull
  accessToken: string
  receipt: TxReceipt
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function toPreview({ fullContentMarkdown: _content, references: _refs, pdfDownloadUrl: _pdf, ...preview }: PaperFull): PaperPreview {
  return preview
}

function findPaper(id: string): PaperFull {
  const paper = MOCK_PAPERS.find((p) => p.id === id)
  if (!paper) throw new Error('PAPER_NOT_FOUND')
  return paper
}

function readAccess(id: string): StoredAccess | null {
  try {
    const raw = window.localStorage.getItem(ACCESS_KEY_PREFIX + id)
    return raw ? (JSON.parse(raw) as StoredAccess) : null
  } catch {
    return null
  }
}

function writeAccess(id: string, access: StoredAccess): void {
  try {
    window.localStorage.setItem(ACCESS_KEY_PREFIX + id, JSON.stringify(access))
  } catch {
    // Sin almacenamiento (modo privado): el acceso dura solo esta visita.
  }
}

function clearAccess(id: string): void {
  try {
    window.localStorage.removeItem(ACCESS_KEY_PREFIX + id)
  } catch {
    // Nada que limpiar.
  }
}

function randomHash(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

function issueAccess(id: string, txHash: string): StoredAccess {
  const now = Date.now()
  const receipt: TxReceipt = {
    txHash,
    amount: DEFAULT_PAPER_PRICE_USDC,
    date: new Date(now).toISOString(),
    validUntil: new Date(now + ACCESS_TOKEN_EXPIRATION_HOURS * 3600 * 1000).toISOString(),
  }
  const access = { accessToken: `mock.${btoa(`${id}:${txHash}`)}`, receipt }
  writeAccess(id, access)
  return access
}

export async function getPapers(): Promise<PaperPreview[]> {
  await delay(400)
  return MOCK_PAPERS.map(toPreview)
}

export async function getPaper(id: string): Promise<PaperResult> {
  await delay(500)
  const paper = findPaper(id)
  const access = readAccess(id)

  if (access && new Date(access.receipt.validUntil) > new Date()) {
    return { status: 'unlocked', paper, receipt: access.receipt }
  }
  if (access) clearAccess(id)

  return { status: 'locked', preview: toPreview(paper), expired: access !== null }
}

export async function payForPaper(
  id: string,
  _address: string,
  onSigned: () => void,
): Promise<PaymentResult> {
  findPaper(id)
  await delay(1500) // el lector firma en su wallet
  onSigned()
  await delay(3500) // el facilitador liquida en Stellar
  const access = issueAccess(id, randomHash())
  return { paper: findPaper(id), accessToken: access.accessToken, receipt: access.receipt }
}

// Solo para el panel de depuración (?debug=1): desbloquea sin pasar por el pago.
export function debugUnlock(id: string): { paper: PaperFull; receipt: TxReceipt } {
  const access = issueAccess(id, randomHash())
  return { paper: findPaper(id), receipt: access.receipt }
}

export const isSimulatedPayment = true
