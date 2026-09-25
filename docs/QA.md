# Estado de QA

Revisión local del 24 de septiembre de 2026. Este archivo describe resultados observados en el repositorio, no certifica el servicio desplegado.

## Verificado

- API: 28 pruebas locales de catálogo, 402, JWT, parsing y control del modo demo.
- Compilación TypeScript del API y comprobación de tipos del frontend.
- Build de producción del monorepo con webpack y arranque local de la API en `NODE_ENV=production`; `/api/health` respondió 200. Esto no comprueba el facilitador.
- La respuesta 402 incluye preview sin texto completo.
- El recorrido mock de la UI está implementado y su compilación pasa; no se ejecutó una prueba de navegador.

## Pendiente para afirmar funcionamiento de pagos reales

1. Implementar firma de pago con Freighter y documentar exactamente el payload que acepta el facilitador.
2. Verificar con un pago Testnet real la respuesta del facilitador, su hash y el saldo recibido por la tesorería.
3. Elegir y probar una única ruta de liquidación: el facilitador espera una firma de autorización Soroban y `SELF_SETTLE` espera una transacción clásica completa. No son intercambiables.
4. Añadir protección contra reutilización de comprobantes y vincular el pago al artículo antes de emitir el JWT.
5. Reemplazar los artículos ficticios por material cuya licencia permita distribución.
6. Validar el despliegue público, CORS, configuración de producción y el recorrido completo desde un navegador con Freighter.

Las pruebas locales de controlador simulan la liquidación. El script `test:testnet` solo prueba conectividad, fondeo de una cuenta de prueba y el reto 402. Ninguno prueba una transferencia de USDC.
