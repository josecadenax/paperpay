import { STELLAR_NETWORK_PASSPHRASE } from '@paperpay/shared'
import { PaywallError } from '@/lib/errors'
import type { WalletInfo } from '@/lib/types'

const MOCK_ADDRESS = 'GAPAPERPAYDEMOLECTORUNAMTESTNETWALLET2026GOYAHACKX7QZ4MN'

// Modo de wallet: por defecto lo fija NEXT_PUBLIC_WALLET, pero se puede forzar por URL
// (?wallet=freighter o ?wallet=mock). La elección se recuerda durante la sesión para que
// sobreviva a la navegación entre páginas (los links internos no arrastran la query).
const WALLET_KEY = 'paperpay:wallet'

export function isFreighter(): boolean {
  try {
    const param = new URLSearchParams(window.location.search).get('wallet')
    if (param === 'freighter' || param === 'mock') {
      sessionStorage.setItem(WALLET_KEY, param)
    }
    const mode = sessionStorage.getItem(WALLET_KEY)
    if (mode === 'freighter') return true
    if (mode === 'mock') return false
  } catch {
    // Sin window/almacenamiento (SSR o modo privado): usa la variable de entorno.
  }
  return process.env.NEXT_PUBLIC_WALLET === 'freighter'
}

async function connectMock(): Promise<WalletInfo> {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return { address: MOCK_ADDRESS, network: 'TESTNET' }
}

async function connectFreighter(): Promise<WalletInfo> {
  const freighter = await import('@stellar/freighter-api')

  const connection = await freighter.isConnected()
  if (connection.error || !connection.isConnected) throw new PaywallError('NO_WALLET')

  const access = await freighter.requestAccess()
  if (access.error || !access.address) throw new PaywallError('USER_REJECTED')

  const network = await freighter.getNetwork()
  if (network.error || network.network !== 'TESTNET') throw new PaywallError('WRONG_NETWORK')

  return { address: access.address, network: network.network }
}

export function connectWallet(): Promise<WalletInfo> {
  return isFreighter() ? connectFreighter() : connectMock()
}

// Firma la transacción con Freighter y devuelve el XDR firmado (el backend la envía).
export async function signTxXdr(unsignedXdr: string, address: string): Promise<string> {
  const freighter = await import('@stellar/freighter-api')
  const res = await freighter.signTransaction(unsignedXdr, {
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
    address,
  })
  if (res.error || !res.signedTxXdr) throw new PaywallError('USER_REJECTED')
  return res.signedTxXdr
}
