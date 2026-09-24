# @paperpay/web

Frontend de PaperPay (Next.js + Tailwind), portado del prototipo de Figma Make.

```bash
pnpm install
pnpm dev:web      # desde la raíz → http://localhost:3000
```

## Qué está simulado hoy

Mientras el backend termina la liquidación real, todo corre en el navegador:

| Pieza | Hoy | Cuando el backend esté listo |
|---|---|---|
| Catálogo | `src/mocks/papers.json` (copia de `apps/api/data/papers.json`) | `GET /api/papers` |
| Artículo bloqueado / desbloqueado | `src/services/paperpay.ts` | `GET /api/papers/:id` (402 o 200 con `Bearer`) |
| Pago | Demoras simuladas y hash aleatorio | Firma con Freighter + `PAYMENT-SIGNATURE` |
| Wallet | `NEXT_PUBLIC_WALLET=mock` (default) | `NEXT_PUBLIC_WALLET=freighter` ya conecta y valida la red |
| Acceso de 24 h | `localStorage` (`paperpay:access:<id>`) | Igual, guardando el JWT del backend |

Para integrar el backend solo cambia `src/services/paperpay.ts`; las pantallas y `usePaywall` no deberían tocarse.

## Revisar todos los estados

Agrega `?debug=1` a la URL de un artículo para forzar cualquier estado del pago o error
(wallet no detectada, red incorrecta, fondos insuficientes, etc.).
