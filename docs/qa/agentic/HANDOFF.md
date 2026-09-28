# Traspaso de agentic payments

Fecha: 28 de septiembre de 2026. Rama de este trabajo: `feat/agentic-payments`.

## Qué quedó subido

- `docs/AGENTIC_PAYMENTS.md`: diseño general y fases, subido previamente como `e4d005d`.
- Spike local AP-00: dependencias oficiales x402 2.27.0 fijadas, prueba del reto HTTP 402, probe de `/supported` y evidencia en [`AP-00.md`](AP-00.md). No ejecuta pagos ni habilita rutas de cobro.
- `pnpm test`: 34 pruebas pasan. `pnpm build:shared` y `pnpm build:api` pasan.

## Trabajo paralelo detectado

Al actualizar referencias remotas apareció [`origin/spike/agentic-x402`](https://github.com/josecadenax/paperpay/tree/spike/agentic-x402), con un spike más completo: servidor y cliente oficiales, fixture del reto, diario de pago y un script de conciliación por RPC. No se fusionó aquí porque es trabajo independiente en otra rama. Su README declara que todavía faltan un pago real y una prueba de timeout inducido.

`origin/main` también avanzó a v2.0.0 y posteriores. La rama de este documento parte del estado de Pollar en `d677750`; antes de integrar cualquier implementación futura habrá que comparar el spike paralelo y actualizar la rama con los cambios del producto, resolviendo los conflictos normalmente.

## Precaución técnica para la siguiente PC

El API actual usa `@stellar/stellar-sdk` 13, mientras `@x402/stellar` 2.27.0 instala Stellar SDK 16 en su árbol de dependencias. El test de cabecera 402 pasa, pero eso no demuestra que los dos SDK funcionen juntos en un pago real. El spike paralelo ya registró esta diferencia. Revisar su resultado y decidir si se aísla el cliente, se migra el API o se mantiene un proceso separado antes de habilitar cobros.

El primer paso de continuación es leer ambos documentos de AP-00 y el README del spike paralelo, deduplicar hallazgos y cerrar los criterios abiertos del plan: pago real de Testnet, recuperación comprobada tras respuesta perdida y persistencia antes de liquidar. No ejecutar otra compra mientras haya un intento previo con estado incierto.

## Comandos de reanudación

```bash
git fetch origin
git switch feat/agentic-payments
git status --short --branch
pnpm install --frozen-lockfile
pnpm test
pnpm build:shared
pnpm build:api
pnpm --filter @paperpay/api test:agentic-capability
```

La última línea consulta la capacidad actual del facilitador público; no firma ni paga. Para OpenZeppelin, usar credenciales propias en el entorno del proceso y las variables descritas en [`AP-00.md`](AP-00.md).
