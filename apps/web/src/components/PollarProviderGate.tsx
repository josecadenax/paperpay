'use client'

import { PollarProvider } from '@pollar/react'
import { POLLAR_PUBLISHABLE_KEY } from '@/services/walletMode'

// Monta el provider de Pollar solo cuando hay publishable key (v2). Sin key (v1/main),
// renderiza los hijos sin envolver: no carga el SDK ni cambia nada. La key es una
// constante de build (misma en server y cliente), así que no hay desincronización ni
// hidratación inconsistente, y usePollar siempre tiene su provider cuando aplica.
//
// Nota: durante el prerender/SSR el SDK avisa que se instancia en server (usa APIs de
// navegador). Es inofensivo: en cliente se inicializa bien. Se prefiere este warning a
// montar el provider tras el mount, que remontaría todo el árbol y recargaría la página.
export function PollarProviderGate({ children }: { children: React.ReactNode }) {
  if (!POLLAR_PUBLISHABLE_KEY) return <>{children}</>
  return <PollarProvider client={{ apiKey: POLLAR_PUBLISHABLE_KEY }}>{children}</PollarProvider>
}
