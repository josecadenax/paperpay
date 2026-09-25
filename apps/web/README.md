# Frontend de PaperPay

```bash
cp apps/web/.env.example apps/web/.env.local
pnpm install
pnpm dev:web
```

Abre `http://localhost:3000`. El ejemplo inicia en modo `mock`: catálogo y compra simulada en el navegador, sin fondos ni API. Los artículos, autores y DOI son datos ficticios. El recibo indica que el pago es simulado.

`NEXT_PUBLIC_DATA_SOURCE=api` usa el backend. Next reenvía `/api/*` a `API_PROXY_TARGET` (por defecto la URL de Railway definida en `next.config.ts`). Para backend local configura `API_PROXY_TARGET=http://localhost:4000`. Reinicia Next después de cambiar estas variables. `NEXT_PUBLIC_API_URL` permite llamar directamente desde el navegador si CORS está configurado.

El frontend **todavía no firma pagos**: `apiBackend.ts` envía `unsigned-demo-signature`. En la API solo se acepta al configurar `DEMO_PAYMENTS=true` fuera de producción. Con pagos simulados desactivados, el intento devuelve un error y no desbloquea el artículo. `NEXT_PUBLIC_WALLET=freighter` conecta y comprueba Testnet, pero no firma la transferencia; `mock` usa una dirección ficticia.

El JWT y el recibo se guardan en `localStorage` por artículo. El servidor valida el JWT en cada lectura y caduca a las 24 horas. El panel `?debug=1` solo aparece en compilaciones de desarrollo y permite forzar estados de la interfaz para QA.

Comprobación estática: `pnpm --filter @paperpay/web typecheck`. Compilación: `pnpm --filter @paperpay/web build`.
