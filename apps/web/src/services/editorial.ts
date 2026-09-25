import { DEFAULT_PAPER_PRICE_USDC, STELLAR_HORIZON_URL, USDC_TESTNET_ISSUER } from '@paperpay/shared'

/*
 * Resumen de transferencias USDC entrantes a la tesorería (Horizon, público).
 * El ledger no indica qué artículo se leyó ni si la transferencia vino de PaperPay.
 * La división 98/2 es una estimación visual; no se liquida por separado.
 */

const PUBLISHER_SHARE = 0.98
const PLATFORM_FEE = 0.02
const CHART_DAYS = 14
const MAX_PAYMENTS = 200 // suficiente para la demo

export interface EditorialTx {
  hash: string
  amount: number
  from: string
  date: string
}

export interface EditorialStats {
  reads: number
  totalUsdc: number
  publisherUsdc: number
  feeUsdc: number
  perDay: { label: string; count: number }[]
  recent: EditorialTx[]
}

interface HorizonPayment {
  type: string
  asset_code?: string
  asset_issuer?: string
  to?: string
  from: string
  amount: string
  created_at: string
  transaction_hash: string
}

async function getTreasury(): Promise<string> {
  const res = await fetch('/api/health', { signal: AbortSignal.timeout(10_000) })
  if (!res.ok) throw new Error('health')
  const body = (await res.json()) as { treasuryPublicKey: string }
  return body.treasuryPublicKey
}

function dayKey(iso: string): string {
  return iso.slice(0, 10)
}

export async function getEditorialStats(): Promise<EditorialStats> {
  const treasury = await getTreasury()

  const url = `${STELLAR_HORIZON_URL}/accounts/${treasury}/payments?order=desc&limit=${MAX_PAYMENTS}`
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) })
  if (!res.ok) throw new Error(`horizon ${res.status}`)
  const data = (await res.json()) as { _embedded: { records: HorizonPayment[] } }

  const payments = data._embedded.records.filter(
    (p) => p.type === 'payment' && p.asset_code === 'USDC' &&
      p.asset_issuer === USDC_TESTNET_ISSUER && p.to === treasury,
  )

  const totalUsdc = payments.reduce((sum, p) => sum + Number(p.amount), 0)

  // Conteo por día para los últimos CHART_DAYS
  const counts = new Map<string, number>()
  for (const p of payments) counts.set(dayKey(p.created_at), (counts.get(dayKey(p.created_at)) ?? 0) + 1)
  const perDay = Array.from({ length: CHART_DAYS }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (CHART_DAYS - 1 - i))
    const key = d.toISOString().slice(0, 10)
    return {
      label: new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' }).format(d),
      count: counts.get(key) ?? 0,
    }
  })

  const recent: EditorialTx[] = payments.slice(0, 8).map((p) => ({
    hash: p.transaction_hash,
    amount: Number(p.amount),
    from: p.from,
    date: p.created_at,
  }))

  return {
    reads: payments.length,
    totalUsdc,
    publisherUsdc: totalUsdc * PUBLISHER_SHARE,
    feeUsdc: totalUsdc * PLATFORM_FEE,
    perDay,
    recent,
  }
}

export const READ_PRICE = DEFAULT_PAPER_PRICE_USDC
