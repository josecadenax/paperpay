import {
  ACCESS_TOKEN_EXPIRATION_HOURS,
  X402_HEADERS,
  type ApiErrorResponse,
  type JWTAccessTokenClaims,
  type X402PaymentRequiredHeader,
  type X402PaymentResponseHeader,
  type X402PaymentSignatureHeader,
} from '@paperpay/shared'
import { decodeBase64Json, encodeBase64Json } from '@/lib/base64'
import { PaywallError } from '@/lib/errors'
import type { PaperFull, PaperPreview, PaywallErrorCode, TxReceipt } from '@/lib/types'
import { clearAccess, isAccessValid, readAccess, writeAccess } from './accessStore'
import type { Backend, PaperResult } from './backend'
import { buildPaymentXdr } from './stellarPayment'
import { isFreighter, signTxXdr } from './wallet'

// Vacío = mismo dominio: next.config.ts reenvía /api/* al backend (API_PROXY_TARGET).
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '')

// Wallet simulada (NEXT_PUBLIC_WALLET != freighter): firma de relleno; el backend responde
// con un hash simulado. Con Freighter se construye y firma una transacción real.
const PLACEHOLDER_SIGNATURE = 'unsigned-demo-signature'

const STROOPS_PER_UNIT = 10_000_000

// Condiciones de pago del último 402 por artículo, para no pedirlas dos veces.
const requirements = new Map<string, X402PaymentRequiredHeader>()

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function request(path: string, init: RequestInit = {}, timeoutMs = 10_000): Promise<Response> {
  try {
    return await fetch(`${API_URL}${path}`, { ...init, signal: AbortSignal.timeout(timeoutMs) })
  } catch {
    throw new PaywallError('PAYMENT_FAILED', 'API no disponible')
  }
}

function rememberRequirement(id: string, res: Response): void {
  const raw = res.headers.get(X402_HEADERS.PAYMENT_REQUIRED)
  if (raw) requirements.set(id, decodeBase64Json<X402PaymentRequiredHeader>(raw))
}

async function lockedResult(id: string, res: Response, expired: boolean): Promise<PaperResult> {
  rememberRequirement(id, res)
  const body = (await res.json()) as { preview: PaperPreview }
  return { status: 'locked', preview: body.preview, expired }
}

function tokenExpiry(accessToken: string): string {
  try {
    const claims = decodeBase64Json<JWTAccessTokenClaims>(accessToken.split('.')[1])
    if (claims.exp) return new Date(claims.exp * 1000).toISOString()
  } catch {
    // Token sin payload legible: usamos la vigencia estándar.
  }
  return new Date(Date.now() + ACCESS_TOKEN_EXPIRATION_HOURS * 3600 * 1000).toISOString()
}

function errorCodeFor(message = ''): PaywallErrorCode {
  if (/insufficient|saldo|fondos|balance/i.test(message)) return 'INSUFFICIENT_FUNDS'
  if (/trustline|l[ií]nea de confianza/i.test(message)) return 'NO_TRUSTLINE'
  return 'PAYMENT_FAILED'
}

async function paymentRequirement(id: string): Promise<X402PaymentRequiredHeader> {
  const cached = requirements.get(id)
  if (cached) return cached
  const res = await request(`/api/papers/${encodeURIComponent(id)}`)
  rememberRequirement(id, res)
  const fresh = requirements.get(id)
  if (!fresh) throw new PaywallError('PAYMENT_FAILED', 'El API no devolvió condiciones de pago')
  return fresh
}

export const apiBackend: Backend = {
  async getPapers() {
    const res = await request('/api/papers')
    if (!res.ok) throw new Error(`GET /api/papers → ${res.status}`)
    return (await res.json()) as PaperPreview[]
  },

  async getPaper(id) {
    const path = `/api/papers/${encodeURIComponent(id)}`
    const access = readAccess(id)
    const valid = access !== null && isAccessValid(access)

    if (access && valid) {
      const res = await request(path, { headers: { Authorization: `Bearer ${access.accessToken}` } })
      if (res.ok) {
        const body = (await res.json()) as { paper: PaperFull }
        return { status: 'unlocked', paper: body.paper, receipt: access.receipt }
      }
      clearAccess(id) // el API rechazó el token (p. ej. se reinició con otro secreto)
      if (res.status === 402) return lockedResult(id, res, false)
    }
    if (access && !valid) clearAccess(id)

    const res = await request(path)
    if (res.status === 404) throw new Error('PAPER_NOT_FOUND')
    if (res.status !== 402) throw new Error(`GET ${path} → ${res.status}`)
    return lockedResult(id, res, access !== null && !valid)
  },

  async payForPaper(id, address, onSigned) {
    const terms = (await paymentRequirement(id)).accepts[0]

    let signaturePayload: string
    if (isFreighter()) {
      // Real: construir el pago de USDC, firmarlo con Freighter (el backend lo envía).
      const unsignedXdr = await buildPaymentXdr(address, { payTo: terms.payTo, amountStroops: terms.amount })
      signaturePayload = await signTxXdr(unsignedXdr, address) // abre la ventana de Freighter
      onSigned()
    } else {
      // Simulado: firma de relleno; el backend responde con un hash simulado.
      signaturePayload = PLACEHOLDER_SIGNATURE
      await delay(800)
      onSigned()
    }

    const signature: X402PaymentSignatureHeader = {
      scheme: 'exact',
      network: terms.network,
      signerPublicKey: address,
      signature: signaturePayload,
    }

    const res = await request(
      `/api/papers/${encodeURIComponent(id)}`,
      { headers: { [X402_HEADERS.PAYMENT_SIGNATURE]: encodeBase64Json(signature) } },
      30_000,
    )

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as Partial<ApiErrorResponse>
      throw new PaywallError(errorCodeFor(body.message), body.message)
    }

    const body = (await res.json()) as { paper: PaperFull; accessToken: string; txHash: string }
    const rawResponse = res.headers.get(X402_HEADERS.PAYMENT_RESPONSE)
    const settlement = rawResponse ? decodeBase64Json<X402PaymentResponseHeader>(rawResponse) : null

    const receipt: TxReceipt = {
      txHash: settlement?.txHash ?? body.txHash,
      amount: Number(terms.amount) / STROOPS_PER_UNIT,
      date: settlement?.settledAt || new Date().toISOString(),
      validUntil: tokenExpiry(body.accessToken),
    }
    writeAccess(id, { accessToken: body.accessToken, receipt })
    requirements.delete(id)
    return { paper: body.paper, accessToken: body.accessToken, receipt }
  },
}
