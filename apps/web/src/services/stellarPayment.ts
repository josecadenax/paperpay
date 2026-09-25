import {
  STELLAR_HORIZON_URL,
  STELLAR_NETWORK_PASSPHRASE,
  USDC_TESTNET_ISSUER,
} from '@paperpay/shared'

/*
 * Construye la transacción clásica de pago que el backend espera:
 * un payment de USDC (issuer de Circle) del lector a la tesorería.
 * El frontend SOLO la construye y la firma; el backend la envía a Stellar.
 */

const STROOPS_PER_UNIT = 10_000_000

export interface PaymentTerms {
  payTo: string
  amountStroops: string
}

export async function buildPaymentXdr(payerAddress: string, terms: PaymentTerms): Promise<string> {
  // Import diferido: el SDK solo se carga cuando de verdad se va a pagar con Freighter.
  const { Horizon, TransactionBuilder, Networks, Operation, Asset, BASE_FEE } = await import('@stellar/stellar-sdk')

  const server = new Horizon.Server(STELLAR_HORIZON_URL)
  const account = await server.loadAccount(payerAddress)

  const usdc = new Asset('USDC', USDC_TESTNET_ISSUER)
  const amount = (Number(terms.amountStroops) / STROOPS_PER_UNIT).toFixed(7)

  const tx = new TransactionBuilder(account, {
    fee: String(Number(BASE_FEE) * 10),
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(Operation.payment({ destination: terms.payTo, asset: usdc, amount }))
    .setTimeout(120)
    .build()

  return tx.toXDR()
}

export { STELLAR_NETWORK_PASSPHRASE }
