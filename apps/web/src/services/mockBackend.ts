import { ACCESS_TOKEN_EXPIRATION_HOURS, DEFAULT_PAPER_PRICE_USDC } from '@paperpay/shared'
import type { PaperFull, PaperPreview, TxReceipt } from '@/lib/types'
import { MOCK_PAPERS } from '@/mocks/catalog'
import { clearAccess, isAccessValid, readAccess, writeAccess, type StoredAccess } from './accessStore'
import type { Backend } from './backend'

// Backend 100% en el navegador: sirve sin API y como respaldo si el API se cae en la demo.

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function toPreview({ fullContentMarkdown: _content, references: _refs, pdfDownloadUrl: _pdf, ...preview }: PaperFull): PaperPreview {
  return preview
}

function findPaper(id: string): PaperFull {
  const paper = MOCK_PAPERS.find((p) => p.id === id)
  if (!paper) throw new Error('PAPER_NOT_FOUND')
  return paper
}

function randomHash(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

function issueAccess(id: string): StoredAccess {
  const now = Date.now()
  const txHash = randomHash()
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

export const mockBackend: Backend = {
  async getPapers() {
    await delay(400)
    return MOCK_PAPERS.map(toPreview)
  },

  async getPaper(id) {
    await delay(500)
    const paper = findPaper(id)
    const access = readAccess(id)

    if (access && isAccessValid(access)) return { status: 'unlocked', paper, receipt: access.receipt }
    if (access) clearAccess(id)
    return { status: 'locked', preview: toPreview(paper), expired: access !== null }
  },

  async payForPaper(id, _address, onSigned) {
    findPaper(id)
    await delay(1500) // el lector firma en su wallet
    onSigned()
    await delay(3500) // el facilitador liquida en Stellar
    const access = issueAccess(id)
    return { paper: findPaper(id), accessToken: access.accessToken, receipt: access.receipt }
  },
}

// Solo para el panel de depuración (?debug=1): desbloquea sin pasar por el pago.
export function debugUnlock(id: string): { paper: PaperFull; receipt: TxReceipt } {
  const access = issueAccess(id)
  return { paper: findPaper(id), receipt: access.receipt }
}
