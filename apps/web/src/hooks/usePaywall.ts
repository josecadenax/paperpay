'use client'

import { useCallback, useState } from 'react'
import type { PaperFull, PaywallErrorCode, PaywallState, TxReceipt, WalletInfo } from '@/lib/types'
import { debugUnlock, payForPaper } from '@/services/paperpay'
import { PaywallError } from '@/lib/errors'
import { connectWallet } from '@/services/wallet'

export function usePaywall(paperId: string) {
  const [state, setState] = useState<PaywallState>('locked')
  const [errorCode, setErrorCode] = useState<PaywallErrorCode | null>(null)
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [paper, setPaper] = useState<PaperFull | null>(null)
  const [receipt, setReceipt] = useState<TxReceipt | null>(null)

  const fail = useCallback((code: PaywallErrorCode) => {
    setErrorCode(code)
    setState('error')
  }, [])

  const unlock = useCallback((fullPaper: PaperFull, txReceipt: TxReceipt) => {
    setPaper(fullPaper)
    setReceipt(txReceipt)
    setErrorCode(null)
    setState('unlocked')
  }, [])

  const startPayment = useCallback(async () => {
    try {
      setErrorCode(null)
      setState('connecting')
      const connected = wallet ?? (await connectWallet())
      setWallet(connected)

      setState('awaitingSignature')
      const result = await payForPaper(paperId, connected.address, () => setState('settling'))
      unlock(result.paper, result.receipt)
    } catch (err) {
      fail(err instanceof PaywallError ? err.code : 'PAYMENT_FAILED')
    }
  }, [paperId, wallet, unlock, fail])

  const retry = useCallback(() => {
    setErrorCode(null)
    setState('locked')
  }, [])

  const forceState = useCallback(
    (next: PaywallState) => {
      if (next === 'unlocked') {
        const result = debugUnlock(paperId)
        unlock(result.paper, result.receipt)
        return
      }
      setErrorCode(null)
      setState(next)
    },
    [paperId, unlock],
  )

  return { state, errorCode, wallet, paper, receipt, startPayment, retry, unlock, fail, forceState }
}
