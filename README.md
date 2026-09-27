<p align="center"><img src="apps/web/public/brand/paperpay-logo.svg" alt="PaperPay" height="56"></p>

# PaperPay

Paywall para artículos científicos: el lector paga un micropago en USDC sobre Stellar y desbloquea el artículo, sin crear cuenta ni usar tarjeta. Proyecto del track Stellar de Goya Hack 2026, construido con Next.js, Express y Stellar **Testnet**.

- **Sitio:** [paperpay.press](https://paperpay.press/)
- **Versión:** 2.0.0 (v1: Freighter · v2: Pollar con login social)

El catálogo contiene **52 artículos ficticios de demostración** en 10 disciplinas; sus autores, DOI, resultados y cifras no son publicaciones reales. El precio de 0.50 USDC y el reparto 98% editorial / 2% PaperPay son propuestas iniciales.

## Estado actual

| Componente | Estado |
| --- | --- |
| Catálogo, vista previa y respuesta HTTP 402 | Implementado. El texto completo solo sale del servidor tras el pago. |
| Pago con **Freighter** (v1) | Implementado. El navegador construye y firma una transacción clásica de 0.50 USDC y la API la envía a Horizon (`SELF_SETTLE`). |
| Pago con **Pollar** (v2) | Implementado. Login con Google o email; Pollar firma y envía el pago y la API lo verifica por hash en Horizon (`POST /api/papers/:id/verify`). Requiere la publishable key de Pollar. |
| Selector de wallet | Implementado. Con la key de Pollar configurada, el paywall ofrece Pollar y Freighter. |
| Acceso tras el pago | JWT de 24 horas por artículo, guardado en el navegador. El catálogo marca los artículos con acceso vigente. |
| Panel editorial (`/editorial`) | Lee de Horizon los pagos entrantes a la tesorería. El reparto 98/2 es un cálculo visual, no se ejecuta en la red. |
| Pagos simulados (`mock`) | Disponibles para demos locales; no mueven fondos. |
| Facilitador OpenZeppelin | Integración presente, sin liquidación real verificada. |
| Contrato Soroban de reparto | No existe; está en el roadmap. |

Las cabeceras `payment-required`, `payment-signature` y `payment-response` siguen el esquema de x402, pero el payload es propio y el proyecto no usa los paquetes oficiales de x402: no debe presentarse como interoperabilidad certificada con x402. El estado comprobado y sus límites están en [docs/QA.md](docs/QA.md).

## Despliegue

| Parte | Dónde | Cómo |
| --- | --- | --- |
| Frontend | Vercel ([paperpay.press](https://paperpay.press/)) | Workflow `deploy-web-vercel.yml` en cada push a `main` que toque `apps/web`, `packages/shared` o dependencias. Los PR generan preview. |
| API | Railway | Workflow `deploy-api-railway.yml` en cada push a `main` que toque `apps/api`, `packages/shared` o dependencias. Corre las pruebas antes de desplegar. |

Ambos usan secretos del repositorio (`VERCEL_TOKEN`, `RAILWAY_API_TOKEN`); los IDs de proyecto que aparecen en los workflows no son secretos.

## Requisitos y arranque local

Node.js 20 o superior y pnpm 9 o superior (CI usa Node 22 y pnpm 10).

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm dev:web
```

Abre `http://localhost:3000`. El `.env.example` del frontend apunta a la API desplegada con Freighter. Para una demo local sin backend ni wallet, usa `NEXT_PUBLIC_DATA_SOURCE=mock` y `NEXT_PUBLIC_WALLET=mock`: el catálogo y el desbloqueo funcionan en el navegador sin mover fondos.

Para levantar la API local:

```bash
cp apps/api/.env.example apps/api/.env
pnpm dev:api
curl http://localhost:4000/api/health
curl -i http://localhost:4000/api/papers/autonomous-ai-micropayments
```

`GET /api/papers/:id` responde `402` con la vista previa y la cabecera `payment-required`. Para conectar el frontend a esta API, usa `API_PROXY_TARGET=http://localhost:4000` en `apps/web/.env.local` y reinicia Next. Los detalles de cada modo están en los README de [la API](apps/api/README.md) y [el frontend](apps/web/README.md).

## Verificación

```bash
pnpm test                               # 37 pruebas de la API
pnpm build:shared && pnpm build:api
pnpm --filter @paperpay/web typecheck
pnpm build
```

Las pruebas cubren el catálogo, el 402, JWT, el modo demo y la verificación por hash con respuestas de Horizon simuladas. No ejecutan un pago real. `pnpm --filter @paperpay/api test:testnet` comprueba Friendbot, Horizon y el 402 contra una API local, también sin pagar.

## Seguridad y configuración de producción

La API se niega a arrancar en `NODE_ENV=production` sin un `JWT_SECRET` propio de al menos 32 caracteres (rechaza el valor por defecto y los de ejemplo que han aparecido en el repositorio), una `STELLAR_TREASURY_PUBLIC_KEY` válida y, si no usa `SELF_SETTLE`, una `OPENZEPPELIN_API_KEY`. Genera el `JWT_SECRET` de forma aleatoria; los valores de los archivos de ejemplo y de la historia del repositorio son públicos y no deben usarse. La clave de tesorería de ejemplo no es una cuenta real. `DEMO_PAYMENTS` se desactiva siempre en producción.

La protección contra reutilizar un hash de Pollar vive en memoria: un reinicio o varias instancias la pierden. Antes de mainnet debe pasar a un almacén persistente.

## Documentación

- [API](apps/api/README.md): variables, endpoints y modos de liquidación.
- [Frontend](apps/web/README.md): modos de datos y de wallet, Pollar y panel editorial.
- [QA](docs/QA.md): qué está comprobado y qué falta.
- [Resumen ejecutivo](docs/RESUMEN_EJECUTIVO.md), [plan](docs/PLAN.md), [flujo de usuario](docs/FLUJO_USUARIO.md), [PRD](docs/PRD_BACKEND.md), [TDD](docs/TDD_BACKEND.md) y [panorama competitivo](<docs/PaperPay  panorama competitivo DeSci, Web3 y micropagos científicos.md>): documentos de planeación del 23 y 24 de septiembre. Describen la intención original; cada uno indica al inicio en qué difiere de lo implementado.

No hay licencia definida para este repositorio: el código es público, pero sin una licencia no se concede permiso de reutilización.
