<p align="center"><img src="apps/web/public/brand/paperpay-logo.svg" alt="PaperPay" height="56"></p>

# PaperPay

Prototipo de paywall para artículos científicos con Next.js, Express y Stellar Testnet. El catálogo contiene **artículos ficticios de demostración**; sus autores, DOI, resultados y cifras no son publicaciones verificadas.

## Estado actual

| Componente | Estado |
| --- | --- |
| Catálogo, preview y HTTP 402 | Implementado |
| Acceso con JWT de 24 horas tras una respuesta de liquidación | Implementado |
| Demo de pago en el navegador (`mock`) | Implementado; no mueve fondos |
| Demo de pago en API (`DEMO_PAYMENTS=true`) | Implementado solo fuera de producción; devuelve `mock_tx_*` |
| Firma de pago con Freighter | Pendiente: el frontend envía una firma de relleno |
| Liquidación real extremo a extremo | **No verificada**. La integración con OpenZeppelin y la ruta `SELF_SETTLE` requieren pruebas con pagos reales |

El esquema de cabeceras se inspira en x402. Esta implementación usa un payload propio y no incorpora los paquetes oficiales de x402; no debe presentarse como interoperabilidad certificada. Los documentos de `docs/` son planes y especificaciones históricas, no evidencia de funcionalidades terminadas.

## Requisitos y arranque

Node.js 20 o superior y pnpm 9 o superior (versiones probadas: Node 26, pnpm 12).

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm dev:web
```

La configuración de ejemplo usa `NEXT_PUBLIC_DATA_SOURCE=mock` y `NEXT_PUBLIC_WALLET=mock`. Abre `http://localhost:3000`. Puedes recorrer el catálogo y desbloquear artículos sin extensiones ni fondos. La API no es necesaria en este modo.

Para probar la API local y el contrato HTTP:

```bash
cp apps/api/.env.example apps/api/.env
pnpm dev:api
curl http://localhost:4000/api/health
curl http://localhost:4000/api/papers
curl -i http://localhost:4000/api/papers/autonomous-ai-micropayments
```

`GET /api/papers/:id` devuelve `402` con solo el preview y la cabecera `payment-required`. Para conectar el frontend a la API, configura `NEXT_PUBLIC_DATA_SOURCE=api` y `API_PROXY_TARGET=http://localhost:4000` en `apps/web/.env.local`, y reinicia Next. El frontend todavía envía `unsigned-demo-signature`: para recorrer ese flujo local habilita explícitamente `DEMO_PAYMENTS=true` en `apps/api/.env`. Nunca habilites ese modo en un servidor expuesto; el código lo desactiva automáticamente con `NODE_ENV=production`.

## Verificación

```bash
pnpm test
pnpm build:shared
pnpm build:api
pnpm --filter @paperpay/web typecheck
pnpm build
```

`pnpm test` cubre el API, el paywall, JWT y el control explícito del modo demo. `pnpm --filter @paperpay/api test:testnet` comprueba Friendbot, Horizon y el 402; **no ejecuta un pago**. Requiere red y puede fallar por servicios externos. La compilación de Next puede necesitar permiso para crear procesos y abrir puertos internos en entornos aislados.

## Configuración y límites

- [API](apps/api/README.md): variables, endpoints y contrato de pago.
- [Frontend](apps/web/README.md): modos `mock` y `api`, wallet y proxy.
- [Revisión de QA](docs/QA.md): pruebas realizadas y pendientes para poder afirmar pagos reales.

En producción, la API exige un `JWT_SECRET` de al menos 32 caracteres, una `STELLAR_TREASURY_PUBLIC_KEY` válida y `OPENZEPPELIN_API_KEY` si usa el facilitador. Usa un secreto aleatorio. La clave de tesorería de ejemplo no es una cuenta real. `SELF_SETTLE=true` espera un sobre de transacción Stellar ya firmado por el lector; no construye ni firma una transferencia Soroban. El frontend actual tampoco crea ese sobre.

No hay licencia definida para este repositorio.
