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

/*
 * Verificación por hash contra el backend v2:
 * POST /api/papers/:id/verify con { txHash, signerPublicKey } → { paper, accessToken, txHash }.
 * El backend confirma en Horizon que el pago de 0.50 USDC a la tesorería es real y reciente.
 */
export async function settleByHash(paperId: string, txHash: string, signerPublicKey: string): Promise<PollarSettleResult> {
  const res = await fetch(`${API_URL}/api/papers/${encodeURIComponent(paperId)}/verify`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      // Reusa la cabecera x402 para transportar el hash y el firmante, en base64.
      [X402_HEADERS.PAYMENT_SIGNATURE]: encodeBase64Json({
        scheme: 'exact',
        network: 'stellar:testnet',
        signerPublicKey,
        txHash,
      }),
    },
    body: JSON.stringify({ txHash, signerPublicKey }),
    signal: AbortSignal.timeout(30_000),
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string }
    throw new Error(body.message ?? `verify → ${res.status}`)
  }
  return (await res.json()) as PollarSettleResult
}
