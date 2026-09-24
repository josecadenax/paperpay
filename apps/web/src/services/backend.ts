import type { PaperFull, PaperPreview, TxReceipt } from '@/lib/types'

export type PaperResult =
  | { status: 'locked'; preview: PaperPreview; expired: boolean }
  | { status: 'unlocked'; paper: PaperFull; receipt: TxReceipt }

export interface PaymentResult {
  paper: PaperFull
  accessToken: string
  receipt: TxReceipt
}

// Contrato que cumplen el backend simulado y el real; las pantallas solo ven esto.
export interface Backend {
  getPapers(): Promise<PaperPreview[]>
  getPaper(id: string): Promise<PaperResult>
  payForPaper(id: string, address: string, onSigned: () => void): Promise<PaymentResult>
}
