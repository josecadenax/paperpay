import { PaywallError } from '@/lib/errors'
import type { WalletInfo } from '@/lib/types'

const MOCK_ADDRESS = 'GAPAPERPAYDEMOLECTORUNAMTESTNETWALLET2026GOYAHACKX7QZ4MN'

const useFreighter = process.env.NEXT_PUBLIC_WALLET === 'freighter'

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
  return useFreighter ? connectFreighter() : connectMock()
}
