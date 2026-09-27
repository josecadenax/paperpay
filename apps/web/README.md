# Frontend de PaperPay

```bash
cp apps/web/.env.example apps/web/.env.local
pnpm install
pnpm dev:web
```

Abre `http://localhost:3000`. La configuración de ejemplo usa la API desplegada en Railway y la wallet Freighter. Para una demo sin backend ni wallet, cambia a `NEXT_PUBLIC_DATA_SOURCE=mock` y `NEXT_PUBLIC_WALLET=mock`. Los 52 artículos, sus autores y DOI son datos ficticios.

En producción ([paperpay.press](https://paperpay.press/)) el workflow `.github/workflows/deploy-web-vercel.yml` despliega en cada push a `main` que toque `apps/web`, `packages/shared` o las dependencias; las variables se configuran en Vercel.

## Modos de datos y wallet

`NEXT_PUBLIC_DATA_SOURCE=mock` (el valor por defecto si la variable no existe) funciona sin API y nunca transfiere fondos. `NEXT_PUBLIC_DATA_SOURCE=api` usa el backend: Next reenvía `/api/*` a `API_PROXY_TARGET`. Para un backend local, usa `API_PROXY_TARGET=http://localhost:4000` y reinicia Next. `NEXT_PUBLIC_API_URL` permite llamar directamente desde el navegador si CORS está configurado.

`NEXT_PUBLIC_WALLET=mock` usa una dirección ficticia. En modo `api`, envía `unsigned-demo-signature`; la API solo la acepta si `DEMO_PAYMENTS=true` fuera de producción. `NEXT_PUBLIC_WALLET=freighter` conecta la extensión, comprueba Testnet, construye un pago clásico de USDC, pide la firma con Freighter y envía el XDR firmado al backend. Esta ruta requiere `SELF_SETTLE=true` en la API y saldo XLM y USDC de Testnet, además de la trustline de USDC. El lector paga la comisión de red de esa transacción.

El modo de wallet también se puede elegir con `?wallet=freighter`, `?wallet=pollar` o `?wallet=mock`; la selección persiste durante la sesión. Un pago real requiere el modo `api` con Freighter o Pollar. El recibo enlaza al explorador si el backend devuelve un hash de transacción real.

El JWT y el recibo se guardan en `localStorage` por artículo. El servidor valida el JWT en cada lectura y caduca a las 24 horas. El catálogo lee esos accesos y marca como "Comprado" los artículos con acceso vigente en ese navegador. Si falla la respuesta después de enviar una transacción, revisa el historial de la wallet antes de reintentar: el pago podría haberse liquidado igualmente.

## Estado verificado y límites

El 25 de septiembre de 2026 Horizon mostraba transferencias de 0.50 USDC a la tesorería y el backend desplegado respondía `SELF_SETTLE` en `/api/health`; consulta [QA](../../docs/QA.md). El historial público confirma las transferencias, pero no identifica qué artículo desbloqueó cada una. Falta una prueba automatizada que abarque firma, liquidación, respuesta `200` y reingreso con JWT.

El panel editorial lee pagos entrantes desde Horizon. Su cifra de 98% para la editorial y 2% para PaperPay es **un cálculo visual**, no una distribución ejecutada en la red. Cuenta transferencias USDC recibidas, que no necesariamente equivalen a lecturas confirmadas.

Para revisar estados de la interfaz durante desarrollo, agrega `?debug=1` a un artículo. El panel de depuración no aparece en builds de producción.

Verificación estática: `pnpm --filter @paperpay/web typecheck`. Compilación: `pnpm --filter @paperpay/web build`.

## Pollar (v2)

Pollar permite pagar con login social (Google o email): crea la wallet del lector, activa USDC y patrocina la comisión. A diferencia de Freighter, **Pollar firma y envía la transacción**, así que el backend la verifica por hash en Horizon (`POST /api/papers/:id/verify`).

Pollar se activa cuando existe `NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY`. Con la key, el paywall abre un selector (`components/WalletChoiceModal.tsx`) que ofrece Pollar y Freighter; sin ella, el flujo de Freighter queda igual que en v1. Piezas principales:

- `services/walletMode.ts`: modo de wallet (`mock` | `freighter` | `pollar`) y disponibilidad de Pollar.
- `components/PollarProviderGate.tsx`: monta `PollarProvider` solo si hay key.
- `hooks/usePollarCheckout.ts` y `services/pollarPayment.ts`: login, pago con `sendPayment` y verificación por hash.

Si la API no confirma el pago de inmediato (Horizon puede tardar en indexarlo), el frontend guarda el hash pendiente y reintenta la verificación durante unos 2 minutos, para no cobrar dos veces.
