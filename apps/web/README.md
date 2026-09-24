# @paperpay/web

Frontend de PaperPay (Next.js + Tailwind), portado del prototipo de Figma Make.

```bash
cp apps/web/.env.example apps/web/.env.local
pnpm install
pnpm dev:api      # backend en :4000 (otra terminal)
pnpm dev:web      # frontend en http://localhost:3000
```

## Fuente de datos (`NEXT_PUBLIC_DATA_SOURCE`)

| Valor | Qué hace | Cuándo usarlo |
|---|---|---|
| `api` | Catálogo, 402, pago y token de 24 h contra `apps/api` | Desarrollo normal y demo |
| `mock` (default si no hay variable) | Todo en el navegador, sin API | Respaldo si el backend se cae en la demo |

Toda la lógica vive en `src/services/`: `apiBackend.ts` y `mockBackend.ts` cumplen el mismo
contrato (`backend.ts`) y `paperpay.ts` elige uno. Las pantallas y `usePaywall` no cambian.

## Estado del pago real

En modo `api` el flujo HTTP ya es el definitivo: 402 → `payment-signature` → 200 + `payment-response`
+ JWT. Lo único pendiente es la firma: hoy se manda una firma de relleno (`PLACEHOLDER_SIGNATURE` en
`apiBackend.ts`) y el backend en desarrollo responde con un hash simulado (`mock_tx_...`). Cuando exista
la firma real con Freighter (#32), solo cambia ese punto de `payForPaper`.

El recibo detecta los hashes simulados y muestra "Pago simulado" en lugar del link al explorador.

## Wallet (`NEXT_PUBLIC_WALLET`)

`mock` (default) usa una dirección de prueba sin extensión. `freighter` conecta la extensión real y
valida que esté en Testnet.

## Revisar todos los estados

Agrega `?debug=1` a la URL de un artículo para forzar cualquier estado del pago o error.
