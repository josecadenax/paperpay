// Modo de wallet de la app. v1: 'mock' | 'freighter'. v2 agrega 'pollar'.
// Se toma de NEXT_PUBLIC_WALLET y se puede forzar por URL (?wallet=pollar|freighter|mock).
export type WalletMode = 'mock' | 'freighter' | 'pollar'

const VALID: WalletMode[] = ['mock', 'freighter', 'pollar']
const KEY = 'paperpay:wallet'

export function walletMode(): WalletMode {
  try {
    const param = new URLSearchParams(window.location.search).get('wallet')
    if (param && (VALID as string[]).includes(param)) sessionStorage.setItem(KEY, param)
    const stored = sessionStorage.getItem(KEY)
    if (stored && (VALID as string[]).includes(stored)) return stored as WalletMode
  } catch {
    // SSR o sin almacenamiento: cae a la variable de entorno.
  }
  const env = process.env.NEXT_PUBLIC_WALLET
  return env && (VALID as string[]).includes(env) ? (env as WalletMode) : 'mock'
}

// Fija el modo de wallet para el resto de la sesión (lo usa el selector de wallet:
// al elegir Freighter, isFreighter() debe activar la firma real; al elegir Pollar,
// se usa su propio flujo). Comparte la misma clave que wallet.ts.
export function setWalletMode(mode: WalletMode): void {
  try {
    sessionStorage.setItem(KEY, mode)
  } catch {
    // Sin almacenamiento: no se puede recordar; el flujo elegido sigue funcionando en esta vista.
  }
}

export const POLLAR_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY ?? ''

// Pollar solo se activa con modo 'pollar' Y una publishable key configurada.
export function isPollarConfigured(): boolean {
  return walletMode() === 'pollar' && POLLAR_PUBLISHABLE_KEY !== ''
}

// Pollar está DISPONIBLE (como opción a elegir) siempre que haya publishable key,
// sin importar el modo actual. El provider se monta con la key, así que usePollar
// funciona y el selector puede ofrecer Pollar junto a Freighter.
export function isPollarAvailable(): boolean {
  return POLLAR_PUBLISHABLE_KEY !== ''
}
