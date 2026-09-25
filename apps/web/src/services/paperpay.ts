import { apiBackend } from './apiBackend'
import type { Backend } from './backend'
import { mockBackend } from './mockBackend'

/*
 * Punto único de datos del frontend. NEXT_PUBLIC_DATA_SOURCE elige el backend:
 *   api  → apps/api (catálogo, 402, token y pago; real con Freighter y SELF_SETTLE)
 *   mock → todo en el navegador, sin API (respaldo para la demo)
 */
export const dataSource: 'api' | 'mock' = process.env.NEXT_PUBLIC_DATA_SOURCE === 'api' ? 'api' : 'mock'

const backend: Backend = dataSource === 'api' ? apiBackend : mockBackend

export const getPapers = backend.getPapers
export const getPaper = backend.getPaper
export const payForPaper = backend.payForPaper

export { debugUnlock } from './mockBackend'
export type { PaperResult, PaymentResult } from './backend'

// Un hash real de Stellar son 64 caracteres hex; el API marca los simulados con otros formatos
// (mock_tx_..., self_settled_...). En modo mock todo es simulado aunque parezca real.
export function isSimulatedTx(txHash: string): boolean {
  return dataSource === 'mock' || !/^[0-9a-f]{64}$/i.test(txHash)
}
