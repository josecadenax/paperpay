# Estado de QA

Revisión del 25 de septiembre de 2026. El repositorio cambió después de la revisión inicial del 24 de septiembre: ahora incluye firma de transacciones con Freighter y una ruta de liquidación clásica en Stellar Testnet.

## Comprobado

- API: 28 pruebas locales de catálogo, 402, JWT, parsing y control del modo demo. El caso de desbloqueo simula la respuesta de liquidación.
- Compilación del monorepo con webpack y arranque local de la API en `NODE_ENV=production` durante la revisión anterior.
- El backend desplegado respondió `mode: SELF_SETTLE` y anunció la tesorería `GAB2NXBPZMJEPZPXMAAEZDJA7SB6ZQRHTT2KF4Z7LMOEAJKSP4JBCWRV` en [su health check](https://paperpay-backend-production.up.railway.app/api/health).
- [Horizon Testnet](https://horizon-testnet.stellar.org/accounts/GAB2NXBPZMJEPZPXMAAEZDJA7SB6ZQRHTT2KF4Z7LMOEAJKSP4JBCWRV/payments?order=desc&limit=20) registraba 12 pagos entrantes de 0.50 USDC cada uno (6 USDC en total) desde tres cuentas entre `2026-09-25T02:27:22Z` y `2026-09-25T05:35:52Z`. Se filtró el emisor USDC `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5`.
- La [transacción más reciente consultada](https://horizon-testnet.stellar.org/transactions/37618096068d6f9f4b5785e9681a917b85ad1b0483c9a15eddafc1b9c5bdf80a) tiene `successful: true`, una operación y está en el ledger `4858193`.
- El frontend contiene la ruta `api` + `freighter` que construye un sobre de pago USDC, lo firma y lo envía a la API. El backend `SELF_SETTLE` valida el destino, activo y monto antes de enviarlo a Horizon.

## Alcance de esta evidencia

Horizon confirma transferencias reales en **Testnet**. Su historial no demuestra por sí solo que cada una pasó por el navegador ni qué artículo se desbloqueó. No se ejecutó una compra nueva durante esta revisión. El commit `6904eba` declara una verificación manual del pago con el backend desplegado; aquí se verificó de forma independiente la existencia de los pagos y la configuración pública del backend.

`pnpm --filter @paperpay/api test:testnet` comprueba conectividad, fondeo de una cuenta de prueba y el reto 402; no ejecuta una transferencia de USDC. La ruta del facilitador OpenZeppelin no tiene liquidación real verificada en esta revisión.

El build del frontend pasa con webpack, pero emite advertencias al empaquetar `sodium-native` desde el SDK de Stellar. No se ejecutó una compra nueva en navegador durante esta revisión.

## Pendiente

1. Automatizar o registrar una prueba que vincule firma de Freighter, hash confirmado, respuesta `200`, artículo desbloqueado y reingreso con JWT.
2. Vincular el pago al artículo en un comprobante verificable y evitar que el panel editorial equipare cualquier transferencia USDC con una lectura.
3. Verificar el facilitador OpenZeppelin por separado si se quiere ofrecer ese modo. La ruta actual confirmada usa `SELF_SETTLE`, que espera una transacción clásica completa.
4. Reemplazar los artículos ficticios por material con licencia de distribución.
5. Probar errores de red después del envío: el pago puede quedar confirmado aunque el cliente no reciba la respuesta. El usuario debe consultar su wallet antes de reintentar.

El panel editorial calcula 98%/2% sobre los pagos entrantes, pero el código no realiza ese reparto en el ledger.
