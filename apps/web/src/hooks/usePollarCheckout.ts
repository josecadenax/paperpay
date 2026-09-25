'use client'

import { usePollar } from '@pollar/react'
import { useCallback } from 'react'
import type { X402PaymentRequiredHeader } from '@paperpay/shared'
import { pollarPaymentParams, settleByHash, type PollarSettleResult } from '@/services/pollarPayment'

/*
 * Checkout con Pollar (v2), listo para conectar en ArticleView cuando el backend
 * exponga el verify-by-hash. Debe usarse dentro de <PollarProviderGate> activo.
 *
 * Flujo: si no hay sesión → login; luego runTx paga 0.50 USDC a la tesorería y
 * Pollar liquida; con el txHash, el backend verifica y devuelve el artículo + JWT.
 */
export function usePollarCheckout(paperId: string) {
  const { isAuthenticated, wallet, login, runTx } = usePollar()

  const address = wallet?.address ?? null

  const pay = useCallback(
    async (terms: X402PaymentRequiredHeader['accepts'][number]): Promise<PollarSettleResult> => {
      if (!isAuthenticated || !address) {
        login({ provider: 'google' })
        throw new Error('POLLAR_LOGIN_REQUIRED')
      }
      const { operation, params } = pollarPaymentParams(terms)
      const outcome = await runTx(operation, params)
      if (outcome.status !== 'success' || !outcome.hash) {
        throw new Error(outcome.status === 'error' ? (outcome.details ?? 'PAYMENT_FAILED') : 'PAYMENT_PENDING')
      }
      return settleByHash(paperId, outcome.hash, address)
    },
    [paperId, isAuthenticated, address, login, runTx],
  )

  return { isAuthenticated, address, login, pay }
}
