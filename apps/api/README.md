# API de PaperPay

API Express en el puerto 4000. Carga tres artículos ficticios desde `data/papers.json`.

## Inicio

Desde la raíz del repositorio:

```bash
cp apps/api/.env.example apps/api/.env
pnpm dev:api
pnpm test
```

La ruta `/api/health` indica que el proceso responde; no comprueba Horizon ni el facilitador. La URL de Railway mencionada en documentos anteriores no se verifica automáticamente en este repositorio.

## Contrato HTTP

| Solicitud | Respuesta |
| --- | --- |
| `GET /api/health` | `200`: estado, red, modo y dirección configurada |
| `GET /api/papers` | `200`: previews, sin `fullContentMarkdown` |
| `GET /api/papers/:id` sin credenciales | `402`: `{ preview }` y `payment-required` en Base64 JSON |
| `GET /api/papers/:id` con pago aceptado | `200`: `{ paper, accessToken, txHash }` y `payment-response` |
| `GET /api/papers/:id` con `Authorization: Bearer <jwt>` válido para ese artículo | `200`: `{ paper }` |
| `POST /api/papers/:id/verify` | Verifica un pago Pollar enviado previamente y devuelve `{ paper, accessToken, txHash }` |
| ID inexistente | `404`: `PAPER_NOT_FOUND` |

El requisito de pago declara `exact`, `stellar:testnet`, USDC SAC, `5000000` unidades de 7 decimales y la tesorería. `payment-signature` se decodifica como Base64 JSON (también acepta JSON directo). Una respuesta fallida devuelve `402 PAYMENT_FAILED`.

### Verificación Pollar por hash (v2)

Pollar firma y envía la transacción desde su propia wallet. Después, el frontend llama `POST /api/papers/:id/verify` con `{ txHash, signerPublicKey }` y la misma información en la cabecera `payment-signature` codificada como Base64 JSON:

```json
{
  "scheme": "exact",
  "network": "stellar:testnet",
  "txHash": "<hash Stellar de 64 caracteres>",
  "signerPublicKey": "G..."
}
```

La API consulta Horizon y exige que la transacción haya tenido éxito, sea reciente (300 segundos por defecto), pertenezca al firmante y contenga un pago exacto de 0.50 USDC Testnet a la tesorería configurada. Un mismo hash puede reintentarse para el mismo artículo y firmante, de modo que una respuesta de red perdida no obliga a pagar de nuevo; no puede desbloquear otro artículo.

La protección contra repetición se conserva solo en memoria porque la API aún no tiene una base de datos. Un reinicio o varias instancias pierden ese registro. Antes de producción debe sustituirse por un almacén persistente con una restricción única sobre el hash.

## Modos de liquidación

Por defecto la API intenta enviar la firma al URL configurado en `OPENZEPPELIN_CHANNELS_URL`. Exige una respuesta con `success: true` y un hash de 64 caracteres hexadecimales. **Ese contrato de integración no se ha probado con un pago real**; confirmar el formato y el endpoint del facilitador antes de usarlo.

`SELF_SETTLE=true` intenta enviar a Horizon un sobre de transacción clásica Stellar ya firmado. Comprueba que el origen coincida con `signerPublicKey` y que incluya un pago de al menos 0.50 USDC a la tesorería. No firma por el lector, no realiza una llamada Soroban y no asocia el pago criptográficamente con un artículo concreto.

El backend desplegado respondió `mode: SELF_SETTLE` el 25 de septiembre de 2026. La tesorería anunciada tenía 12 pagos confirmados de 0.50 USDC en Horizon; consulta [QA](../../docs/QA.md). Esto verifica transferencias reales en Testnet por la ruta compatible con el frontend Freighter, pero el ledger no demuestra por sí solo el desbloqueo de un artículo ni el reingreso con JWT. El lector paga la comisión de red en este modo.

`DEMO_PAYMENTS=true` acepta las firmas de prueba `unsigned-demo-signature`, `mock_*` y `demo_*`, y emite un hash `mock_tx_*` y JWT sin transferir fondos. Funciona solo con `NODE_ENV` distinto de `production`. Déjalo en `false` salvo para una demo local. Sin este modo, una firma de prueba recibe `402`.

En producción son obligatorios un `JWT_SECRET` de al menos 32 caracteres, una `STELLAR_TREASURY_PUBLIC_KEY` válida y `OPENZEPPELIN_API_KEY` si se usa el facilitador. El ejemplo de `.env` usa una clave de tesorería ficticia. `generate:treasury` crea y fondea una cuenta de Testnet con Friendbot, pero no obtiene USDC ni verifica pagos.

## Pruebas

`pnpm test` ejecuta 33 pruebas locales. Incluye validación simulada de respuestas de Horizon para el flujo Pollar, monto exacto e intento de reutilizar un hash; no prueba un pago externo. `pnpm --filter @paperpay/api test:testnet` verifica Friendbot, Horizon y el paywall de una API local, sin comprar artículos. `pnpm --filter @paperpay/api test:settle` usa una firma de prueba y solo puede desbloquear con `DEMO_PAYMENTS=true`.
