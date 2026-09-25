import type { NextConfig } from 'next'

// El navegador llama a /api/* en el mismo dominio del frontend y Next lo reenvía al backend.
// Así CORS no depende de qué dominio tenga cada deploy (producción, previews de PR o localhost).
const apiProxyTarget = (process.env.API_PROXY_TARGET ?? 'https://paperpay-backend-production.up.railway.app').replace(/\/$/, '')

const nextConfig: NextConfig = {
  transpilePackages: ['@paperpay/shared', '@pollar/react', '@pollar/core'],
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${apiProxyTarget}/api/:path*` }]
  },
}

export default nextConfig
