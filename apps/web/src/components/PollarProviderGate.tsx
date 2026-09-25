'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { isPollarConfigured, POLLAR_PUBLISHABLE_KEY } from '@/services/walletMode'

// El SDK de Pollar solo se carga en el navegador y solo cuando el modo pollar está activo.
// Si no hay key o el modo no es 'pollar', se renderizan los hijos sin envolver: v1 intacto.
const PollarProvider = dynamic(() => import('@pollar/react').then((m) => m.PollarProvider), { ssr: false })

export function PollarProviderGate({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false)

  // walletMode() lee la URL/sessionStorage, así que se evalúa tras montar en el cliente.
  useEffect(() => {
    setActive(isPollarConfigured())
  }, [])

  if (!active) return <>{children}</>

  return <PollarProvider client={{ apiKey: POLLAR_PUBLISHABLE_KEY }}>{children}</PollarProvider>
}
