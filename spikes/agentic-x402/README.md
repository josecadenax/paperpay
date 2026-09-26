# AP-00: x402 v2 en Stellar Testnet

Prototipo aislado del API actual. Usa los paquetes oficiales `@x402/*` 2.27.0 y un recurso de 0.01 USDC para comprobar el contrato HTTP. No entrega artículos del catálogo ni modifica el backend desplegado.

## Reproducir el 402 sin gastar

Requiere Node 22 o superior. Desde este directorio:

```bash
npm ci
cp .env.example .env
npm run server
```

En otra terminal:

```bash
npm run inspect
```

`inspect` debe mostrar `402`, `x402Version: 2`, `exact`, `stellar:testnet`, `amount: 100000` (0.01 USDC de 7 decimales), el contrato USDC de Testnet y `areFeesSponsored: true`. Solo lee la respuesta; no firma ni envía nada.

La cabecera real y su interpretación están en [`fixtures/challenge.json`](fixtures/challenge.json). El fixture usa la URL local del spike y no contiene autorizaciones reutilizables.

## Compra de prueba

Solo para una wallet **dedicada de Testnet**. Antes de ejecutar `npm run pay`, crea una cuenta, fondea XLM con Friendbot, añade la trustline al USDC de Testnet y solicita USDC en [Circle Faucet](https://faucet.circle.com). La [guía de Stellar](https://developers.stellar.org/docs/build/agentic-payments/x402/quickstart-guide) describe los pasos. Pon la clave secreta únicamente en `.env`, que está ignorado por Git, y confirma que `SPIKE_PAY_TO` es la tesorería esperada.

La wallet creada para esta prueba ya tiene XLM y trustline; para fondearla con USDC de Testnet usa esta **dirección pública** en Circle Faucet: `GDSEFKJFERRYF4WIML6SBLWMQLBGLAUUNLAFTOFGJGXMD722ZXBDDRNT`. Su clave está solo en el `.env` local.

```bash
npm run pay
```

El cliente verifica versión, URL del recurso, una sola opción de pago, red, contrato, destinatario, patrocinio de comisiones y precio máximo de 0.01 USDC **antes de firmar**. Puede producir un débito real de USDC de prueba. Imprime el estado, el recibo x402 y el contenido del recurso. Una segunda ejecución puede cobrar de nuevo; este script es solo un spike y no tiene diario de compras ni política durable.

El facilitador por defecto es el público de x402 (`https://www.x402.org/facilitator`). Su `/supported` anunció `exact` en `stellar:testnet` el 26 de septiembre de 2026. El endpoint de OpenZeppelin (`https://channels.openzeppelin.com/x402/testnet`) respondió 401 incluso con la clave configurada actualmente en Railway; requiere una credencial válida antes de probarlo.

## Límites del spike

- Una respuesta perdida después de enviar el pago puede ocultar un débito confirmado. No repitas `npm run pay` para recuperarlo; consulta primero Horizon/Stellar Expert.
- Este script no prueba conciliación tras timeout ni protección contra pagos duplicados. Esos son criterios obligatorios de AP-00 antes de integrar pagos autónomos en PaperPay.
- La API actual de PaperPay devuelve una cabecera `payment-required` con formato propio, sin `x402Version` ni `resource`; el cliente x402 estándar no puede consumir ese endpoint tal como está.
