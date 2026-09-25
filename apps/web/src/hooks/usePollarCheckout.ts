'use client'

import { usePollar } from '@pollar/react'
import { useCallback } from 'react'
import type { X402PaymentRequiredHeader } from '@paperpay/shared'
import {
  clearPendingTx,
  pollarPaymentParams,
  readPendingTx,
  savePendingTx,
  settleByHash,
  SettleError,
  type PollarSettleResult,
} from '@/services/pollarPayment'

/*
 * Checkout con Pollar (v2). Debe usarse dentro de <PollarProviderGate> activo.
 *
 * Flujo: si no hay sesión → login; luego sendPayment paga 0.50 USDC a la tesorería y Pollar
 * liquida; con el txHash, el backend verifica por hash y devuelve el artículo + JWT.
 *
 * Robustez: el pago ya no se puede deshacer una vez enviado. Para no cobrar dos veces:
 *  - Antes de pagar, si hay un txHash pendiente de este artículo (pago previo cuyo verify
 *    no completó), se intenta verificar ESE primero, sin volver a pagar.
 *  - Tras pagar, se guarda el hash ANTES de verificar; si el verify falla de forma transitoria,
 *    el hash queda pendiente para reintentarse (aquí o al recargar) sin pagar de nuevo.
 */
export function usePollarCheckout(paperId: string) {
  const { isAuthenticated, wallet, login, sendPayment } = usePollar()

  const address = wallet?.address ?? null

  const pay = useCallback(
    async (terms: X402PaymentRequiredHeader['accepts'][number]): Promise<PollarSettleResult> => {
      if (!isAuthenticated || !address) {
        login({ provider: 'google' })
        throw new Error('POLLAR_LOGIN_REQUIRED')
      }

      // 1. Recuperación: si hay un pago previo pendiente de verificar, verifícalo sin pagar de nuevo.
      const pending = readPendingTx(paperId)
      if (pending) {
        try {
          const recovered = await settleByHash(paperId, pending.txHash, pending.signerPublicKey)
          clearPendingTx(paperId)
          return recovered
        } catch (err) {
          if (err instanceof SettleError && err.terminal) {
            clearPendingTx(paperId) // el pendiente ya no sirve: seguimos a un pago nuevo
          } else {
            throw err // transitorio: no pagar de nuevo, se reintentará después
          }
        }
      }

      // 2. Pago nuevo.
      const outcome = await sendPayment(pollarPaymentParams(terms))
      if (outcome.status !== 'success' || !outcome.hash) {
        const detail =
          outcome.status === 'error'
            ? (outcome.details ?? outcome.message ?? outcome.resultCode ?? 'PAYMENT_FAILED')
            : 'PAYMENT_PENDING'
        throw new Error(detail)
      }

      // 3. Guarda el hash ANTES de verificar (para poder recuperarlo si el verify falla) y verifica.
      savePendingTx(paperId, { txHash: outcome.hash, signerPublicKey: address })
      const result = await settleByHash(paperId, outcome.hash, address)
      clearPendingTx(paperId)
      return result
    },
    [paperId, isAuthenticated, address, login, sendPayment],
  )

  return { isAuthenticated, address, login, pay }
}
