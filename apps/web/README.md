# Frontend de PaperPay

```bash
cp apps/web/.env.example apps/web/.env.local
pnpm install
pnpm dev:web
```

Abre `http://localhost:3000`. La configuración de ejemplo usa catálogo y pagos simulados en el navegador. Los artículos, autores y DOI son datos ficticios.

## Modos de datos y wallet

`NEXT_PUBLIC_DATA_SOURCE=mock` (por defecto) funciona sin API y nunca transfiere fondos. `NEXT_PUBLIC_DATA_SOURCE=api` usa el backend: Next reenvía `/api/*` a `API_PROXY_TARGET`. Para un backend local, usa `API_PROXY_TARGET=http://localhost:4000` y reinicia Next. `NEXT_PUBLIC_API_URL` permite llamar directamente desde el navegador si CORS está configurado.

`NEXT_PUBLIC_WALLET=mock` usa una dirección ficticia. En modo `api`, envía `unsigned-demo-signature`; la API solo la acepta si `DEMO_PAYMENTS=true` fuera de producción. `NEXT_PUBLIC_WALLET=freighter` conecta la extensión, comprueba Testnet, construye un pago clásico de USDC, pide la firma con Freighter y envía el XDR firmado al backend. Esta ruta requiere `SELF_SETTLE=true` en la API y saldo XLM y USDC de Testnet, además de la trustline de USDC. El lector paga la comisión de red de esa transacción.

El modo de wallet también se puede elegir con `?wallet=freighter` o `?wallet=mock`; la selección persiste durante la sesión. Un pago real solo es posible con **ambos** modos `api` y `freighter`. El recibo enlaza al explorador si el backend devuelve un hash de transacción real.

El JWT y el recibo se guardan en `localStorage` por artículo. El servidor valida el JWT en cada lectura y caduca a las 24 horas. Si falla la respuesta después de enviar una transacción, revisa el historial de la wallet antes de reintentar: el pago podría haberse liquidado igualmente.

## Estado verificado y límites

El 25 de septiembre de 2026 Horizon mostraba transferencias de 0.50 USDC a la tesorería y el backend desplegado respondía `SELF_SETTLE` en `/api/health`; consulta [QA](../../docs/QA.md). El historial público confirma las transferencias, pero no identifica qué artículo desbloqueó cada una. Falta una prueba automatizada que abarque firma, liquidación, respuesta `200` y reingreso con JWT.

El panel editorial lee pagos entrantes desde Horizon. Su cifra de 98% para la editorial y 2% para PaperPay es **un cálculo visual**, no una distribución ejecutada en la red. Cuenta transferencias USDC recibidas, que no necesariamente equivalen a lecturas confirmadas.

Para revisar estados de la interfaz durante desarrollo, agrega `?debug=1` a un artículo. El panel de depuración no aparece en builds de producción.

Verificación estática: `pnpm --filter @paperpay/web typecheck`. Compilación: `pnpm --filter @paperpay/web build`.

## v2 — Pollar (en construcción, rama `feat/pollar-v2`)

Login social (Google/email) con [Pollar](https://pollar.xyz): la wallet la crea Pollar,
activa USDC y patrocina la comisión. A diferencia de Freighter (v1: el frontend firma y el
backend envía), **Pollar firma y envía la transacción**, así que el backend verifica por hash.

Andamiaje ya presente, aislado detrás de `NEXT_PUBLIC_WALLET=pollar` + `NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY`:
- `services/walletMode.ts` — modo de wallet (`mock` | `freighter` | `pollar`).
- `components/PollarProviderGate.tsx` — monta `PollarProvider` solo si el modo pollar está activo y hay key; si no, no cambia nada (v1 intacto).
- `services/pollarPayment.ts` — parámetros de `runTx` y `settleByHash` (verify-by-hash contra el backend).
- `hooks/usePollarCheckout.ts` — login + pago + verify, listo para conectar en `ArticleView`.

**Pendiente para completar v2:** endpoint de verify-by-hash en el backend (#32), la publishable key
de Pollar en el dashboard, y cablear `usePollarCheckout` en el flujo de pago.
