import type { NextConfig } from 'next'

// El navegador llama a /api/* en el mismo dominio del frontend y Next lo reenvía al backend.
// Así CORS no depende de qué dominio tenga cada deploy (producción, previews de PR o localhost).
const apiProxyTarget = (process.env.API_PROXY_TARGET ?? 'https://paperpay-backend-production.up.railway.app').replace(/\/$/, '')

const nextConfig: NextConfig = {
  // En dev, React Strict Mode monta el provider de Pollar dos veces y crea dos
  // PollarClient para la misma API key (avisa que la detección de reuso puede cerrar
  // la sesión). Solo afecta a dev; el build de producción no re-monta. Se desactiva
  // para tener una sola instancia del SDK durante las pruebas de Pollar (v2).
  reactStrictMode: false,
  transpilePackages: ['@paperpay/shared', '@pollar/react', '@pollar/core'],
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${apiProxyTarget}/api/:path*` }]
  },
}

export default nextConfig
