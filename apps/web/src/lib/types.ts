import type {
  PaperFull as SharedPaperFull,
  PaperPreview as SharedPaperPreview,
} from '@paperpay/shared'

// El backend aún no expone disciplina; es opcional y hoy solo viene de los datos simulados.
export type PaperPreview = SharedPaperPreview & { discipline?: string }
export type PaperFull = SharedPaperFull & { discipline?: string }

export type PaywallState =
  | 'locked'
  | 'connecting'
  | 'awaitingSignature'
  | 'settling'
  | 'unlocked'
  | 'error'

export type PaywallErrorCode =
  | 'NO_WALLET'
  | 'WRONG_NETWORK'
  | 'INSUFFICIENT_FUNDS'
  | 'NO_TRUSTLINE'
  | 'USER_REJECTED'
  | 'EXPIRED'
  | 'PAYMENT_FAILED'

export interface TxReceipt {
  txHash: string
  amount: number
  date: string
  validUntil: string
}

export interface WalletInfo {
  address: string
  network: string
}
