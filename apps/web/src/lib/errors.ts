import type { PaywallErrorCode } from './types'

export class PaywallError extends Error {
  constructor(
    public readonly code: PaywallErrorCode,
    detail?: string,
  ) {
    super(detail ?? code)
  }
}
