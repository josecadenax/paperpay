import { USDC_TESTNET_ISSUER, X402_HEADERS, type PaperFull, type X402PaymentRequiredHeader } from '@paperpay/shared'
import { encodeBase64Json } from '@/lib/base64'

/*
 * v2 (Pollar) — flujo de pago:
 *  1. El usuario entra con Google/email (Pollar crea la wallet, activa USDC, patrocina el fee).
 *  2. runTx('payment', …) paga 0.50 USDC a la tesorería; Pollar liquida y devuelve el txHash.
 *  3. Enviamos ese txHash al backend, que VERIFICA el pago on-chain y emite el JWT.
 *
 * A diferencia de Freighter (v1, el frontend firma y el backend envía), aquí Pollar envía
 * la transacción. Por eso el backend verifica por hash (POST /api/papers/:id/verify).
 */

const STROOPS_PER_UNIT = 10_000_000
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '')

// Parámetros del pago de USDC para sendPayment de Pollar, a partir del 402 del backend.
// Forma de SendPaymentParams (Stellar): destino, monto decimal y activo con issuer.
export function pollarPaymentParams(terms: X402PaymentRequiredHeader['accepts'][number]) {
  return {
    chain: 'STELLAR' as const,
    destination: terms.payTo,
    amount: (Number(terms.amount) / STROOPS_PER_UNIT).toFixed(7),
    asset: { type: 'credit_alphanum4' as const, code: 'USDC', issuer: USDC_TESTNET_ISSUER },
  }
}

export interface PollarSettleResult {
  paper: PaperFull
  accessToken: string
  txHash: string
}

// Error de verificación con marca terminal: terminal=true (409/400) no tiene sentido reintentar
// ni recuperar; terminal=false (402/5xx/red) es transitorio y el pago sigue siendo recuperable.
export class SettleError extends Error {
  constructor(
    message: string,
    public readonly terminal: boolean,
  ) {
    super(message)
    this.name = 'SettleError'
  }
}

// Pago de Pollar pendiente de verificar, por artículo. Se guarda ANTES de llamar al verify,
// de modo que si el verify falla (Horizon indexando, 5xx, cierre de pestaña) el mismo hash
// se pueda re-verificar después SIN volver a pagar. Se borra al verificar con éxito.
interface PendingTx {
  txHash: string
  signerPublicKey: string
}
const pendingKey = (paperId: string) => `paperpay:pendingTx:${paperId}`

export function savePendingTx(paperId: string, tx: PendingTx): void {
  try {
    localStorage.setItem(pendingKey(paperId), JSON.stringify(tx))
  } catch {
    // Sin almacenamiento: la recuperación entre recargas no estará disponible, pero el pago sigue.
  }
}

export function readPendingTx(paperId: string): PendingTx | null {
  try {
    const raw = localStorage.getItem(pendingKey(paperId))
    if (!raw) return null
    const tx = JSON.parse(raw) as PendingTx
    return tx.txHash && tx.signerPublicKey ? tx : null
  } catch {
    return null
  }
}

export function clearPendingTx(paperId: string): void {
  try {
    localStorage.removeItem(pendingKey(paperId))
  } catch {
    // sin almacenamiento: nada que limpiar
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/*
 * Verificación por hash contra el backend v2:
 * POST /api/papers/:id/verify con { txHash, signerPublicKey } → { paper, accessToken, txHash }.
 * El backend confirma en Horizon que el pago de 0.50 USDC a la tesorería es real y reciente.
 *
 * Importante: el pago (sendPayment) ya ocurrió cuando se llama esto, así que NO se puede
 * "cancelar". El verify se pide justo después y Horizon puede tardar unos segundos en indexar
 * la transacción (mientras tanto responde 402 "no encontrada", o hay un 5xx transitorio).
 * Por eso se reintenta con el MISMO hash (el backend es idempotente): así un pago exitoso
 * siempre termina desbloqueando, sin que el usuario tenga que pagar de nuevo.
 */
export async function settleByHash(paperId: string, txHash: string, signerPublicKey: string): Promise<PollarSettleResult> {
  const paymentSignature = encodeBase64Json({ scheme: 'exact', network: 'stellar:testnet', signerPublicKey, txHash })
  // Reintentos ante lag de indexación de Horizon (402/5xx). Una tx recién enviada puede tardar
  // ~1-2 min en ser consultable en Horizon, así que la ventana total cubre ~2 min (por debajo de
  // la ventana de recencia del backend, 300s). Como el pago ya ocurrió y el backend es idempotente,
  // reintentar el MISMO hash nunca cobra de más.
  const delaysMs = [0, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 8000, 10000, 10000, 12000, 12000, 15000, 15000]
  let lastError: SettleError = new SettleError('No fue posible verificar el pago.', false)

  for (const delay of delaysMs) {
    if (delay) await sleep(delay)

    let res: Response
    try {
      res = await fetch(`${API_URL}/api/papers/${encodeURIComponent(paperId)}/verify`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', [X402_HEADERS.PAYMENT_SIGNATURE]: paymentSignature },
        body: JSON.stringify({ txHash, signerPublicKey }),
        signal: AbortSignal.timeout(30_000),
      })
    } catch {
      lastError = new SettleError('No se pudo contactar al servidor de verificación.', false)
      continue // error de red: reintentar
    }

    if (res.ok) return (await res.json()) as PollarSettleResult

    const body = (await res.json().catch(() => ({}))) as { message?: string }
    const message = body.message ?? `verify → ${res.status}`
    lastError = new SettleError(message, res.status === 409 || res.status === 400)

    // 409 (ya usado) y 400 (petición inválida) son terminales: no tiene sentido reintentar.
    if (lastError instanceof SettleError && lastError.terminal) throw lastError
    // 402 (aún no indexada / fuera de ventana) y 5xx (transitorio): reintentar.
  }

  throw lastError
}
