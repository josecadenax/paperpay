# PaperPay: Arquitectura y plan de trabajo

Documento vivo. Si una decisión cambia, se edita aquí en el mismo PR que la implementa.

---

## 1. Decisiones de arquitectura (ADR resumidos)

### ADR-01 · Usar x402 estándar con facilitador, no "verificar un hash en Horizon"

Hay dos formas de cobrar con 402 en Stellar:

| Opción | Cómo funciona | Problema |
|---|---|---|
| A. Hash de tx | El cliente envía la tx él mismo y manda el `txHash` al server, que la busca en Horizon | Hay que evitar replays (guardar hashes usados = estado), el lector paga el fee en XLM, más latencia, no es x402 |
| **B. x402 exact scheme (elegida)** | El cliente **firma una auth entry de Soroban** para `USDC.transfer(lector, payTo, monto)`. El server la pasa a un **facilitador** que verifica, envía la tx y paga el fee | Depende de un facilitador (hay dos gratuitos en testnet) |

Con B, el nonce de la auth entry impide replays on-chain, el lector no necesita XLM para fees y usamos las librerías oficiales:

- Server: `@x402/express` + `@x402/stellar` (v2.x)
- Cliente: `@x402/fetch` + firmante con Freighter (`signAuthEntry`)
- Facilitador testnet: **OpenZeppelin Channels** (`https://channels.openzeppelin.com/x402/testnet`, API key en `https://channels.openzeppelin.com/testnet/gen`) o el facilitador de Coinbase.

**Plan B** si el facilitador falla el día de la demo: Dev A tiene listo un modo `SELF_SETTLE=true` que envía la tx con una cuenta propia del server.

### ADR-02 · Encabezados HTTP (x402 v2)

| Dirección | Header | Contenido |
|---|---|---|
| Server → Cliente (402) | `PAYMENT-REQUIRED` | JSON en base64 con los `accepts` (scheme, network, asset, amount, payTo, maxTimeoutSeconds) |
| Cliente → Server | `PAYMENT-SIGNATURE` | JSON en base64 con la auth entry firmada |
| Server → Cliente (200) | `PAYMENT-RESPONSE` | JSON en base64 con el resultado del settle (tx hash) |

**CORS:** el server debe exponer `PAYMENT-REQUIRED` y `PAYMENT-RESPONSE` (`Access-Control-Expose-Headers`) y permitir `PAYMENT-SIGNATURE` (`Access-Control-Allow-Headers`). Si no, el navegador los oculta y el flujo "no funciona" sin error claro.

### ADR-03 · El paywall se aplica en el servidor, no con CSS

El `blur` es solo visual. La respuesta 402 incluye **título, autores, abstract y un fragmento**; el texto completo y el PDF **nunca** llegan al navegador sin pago. Si mandamos el artículo completo y lo difuminamos con CSS, cualquiera lo lee con DevTools.

### ADR-04 · Acceso = JWT ligado a wallet + artículo

- Claims: `sub` = public key del lector, `paperId`, `txHash`, `exp`.
- Vigencia propuesta: 24 h (definir: ¿"lectura única" es una sesión o acceso permanente?).
- Se guarda en `localStorage` bajo `paperpay:access:<paperId>`. Aceptable para el hackathon; en producción iría en cookie `httpOnly`.
- Con JWT válido, `GET /api/papers/:id` responde 200 sin pedir pago.

### ADR-05 · Montos y activo

- USDC en Stellar usa **7 decimales**: $0.50 = `5000000` unidades.
- Contrato USDC testnet (SAC): `CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA`.
- Red: `stellar:testnet`.
- Todo esto vive en `packages/shared/constants.ts`, nunca hardcodeado en dos lugares.

### ADR-06 · Fee de 1.5% a 2% (modelo de negocio)

El exact scheme paga a **una sola** dirección (`payTo`). Para el hackathon:

- `payTo` = tesorería de PaperPay; el reparto a la editorial se registra off-chain y se muestra en el dashboard.
- **Stretch goal:** contrato Soroban "splitter" que reciba el pago y reparta 98% editorial / 2% PaperPay on-chain. Es un buen diferenciador para el jurado, pero solo si sobra tiempo.

### ADR-07 · Contenido de la demo

Solo artículos **open access** (arXiv, CC-BY). Nunca PDFs de Elsevier/Springer reales. Catálogo en un JSON (`apps/api/data/papers.json`), sin base de datos.

---

## 2. Contrato de API (se congela en F0)

### `GET /api/papers`
`200` → lista de `PaperPreview` (id, title, authors, abstract, price, publisher).

### `GET /api/papers/:id`

| Caso | Respuesta |
|---|---|
| Sin pago ni JWT | `402` + header `PAYMENT-REQUIRED` + body `{ preview: PaperPreview }` |
| Con `PAYMENT-SIGNATURE` válida | `200` + header `PAYMENT-RESPONSE` + body `{ paper: PaperFull, accessToken }` |
| Con `Authorization: Bearer <jwt>` válido | `200` + body `{ paper: PaperFull }` |
| Firma inválida / fondos insuficientes | `402` + body `{ error: "<código>" }` |

### `GET /api/papers/:id/pdf`
Mismo esquema de protección; devuelve el PDF (stretch).

Los tipos `PaperPreview`, `PaperFull` y los códigos de error viven en `packages/shared`. **Dev B trabaja contra un mock** de este contrato desde el día 1, sin esperar al backend real.

---

## 3. Plan de tareas

Leyenda: 🅰️ Dev A (backend) · 🅱️ Dev B (frontend) · 🤝 ambos

### F0 · Setup y contrato (bloqueante, hacerlo juntos)
- [ ] 🤝 Monorepo pnpm: `apps/api`, `apps/web`, `packages/shared`
- [ ] 🤝 Tipos y constantes compartidas (red, USDC, precio, headers)
- [ ] 🤝 Congelar el contrato de API de la sección 2
- [ ] 🤝 Crear 2 wallets testnet: tesorería (payTo) y lector de demo; trustline USDC + faucet
- [ ] 🅰️ Obtener API key del facilitador OpenZeppelin (testnet)
- [ ] 🤝 `.env.example` en cada app

### F1 · Backend x402 (🅰️)
- [ ] Express + TS, CORS con headers expuestos (ADR-02)
- [ ] Catálogo `papers.json` con 3 a 5 artículos open access
- [ ] `GET /api/papers` y `GET /api/papers/:id` con 402 + `PAYMENT-REQUIRED`
- [ ] Middleware `@x402/express` + `@x402/stellar` apuntando al facilitador
- [ ] Emisión y validación de JWT (ADR-04)
- [ ] Logs claros: verify, settle, txHash (para mostrar en el pitch)
- [ ] Modo `SELF_SETTLE` de respaldo (ADR-01)
- [ ] Deploy (Render / Railway / Fly)

### F1 · Frontend (🅱️, en paralelo contra mock)
- [ ] Next.js + Tailwind, layout tipo "revista científica"
- [ ] Catálogo de artículos
- [ ] Vista de artículo con blur paywall + CTA "Leer por $0.50 USDC"
- [ ] Conexión Freighter: detectar extensión, `requestAccess`, validar red = Testnet
- [ ] Mock del API (MSW o route handlers) según el contrato
- [ ] Deploy (Vercel)

### F2 · Integración end-to-end (🤝)
- [ ] 🅱️ Interceptar 402 → firmar con Freighter (`signAuthEntry`) → reintentar con `PAYMENT-SIGNATURE`
- [ ] 🅱️ Desbloqueo animado + guardar JWT en `localStorage`
- [ ] 🅱️ Link al explorer (stellar.expert) con el txHash
- [ ] 🤝 Pruebas: sin Freighter, red equivocada, sin trustline, sin saldo, firma cancelada, JWT expirado
- [ ] 🅱️ Mensajes de error humanos para cada caso

### F3 · Demo y pitch (🤝)
- [ ] Guía o botón "Preparar wallet de demo" (friendbot + trustline + faucet)
- [ ] Dashboard mínimo de editorial: ventas, ingresos, fee PaperPay
- [ ] Video de respaldo del flujo completo (por si falla la red en vivo)
- [ ] Slides: problema → demo → modelo de negocio → roadmap
- [ ] README final con capturas y URLs desplegadas

### F4 · Stretch
- [ ] Contrato Soroban splitter 98/2 (ADR-06)
- [ ] Descarga de PDF protegido
- [ ] Soporte a agentes de IA pagando vía x402 (mismo endpoint, sin UI)

---

## 4. Flujo de trabajo en GitHub

**Tablero:** GitHub Projects (tabla + board) con columnas `Todo · In progress · In review · Done`. Cada tarea de la sección 3 es un **issue**.

- **Labels:** `backend`, `frontend`, `shared`, `infra`, `demo`, `blocker`
- **Milestones:** `F0 Setup`, `F1 Core`, `F2 Integración`, `F3 Demo`, `F4 Stretch`
- **Asignación:** cada issue tiene un solo responsable.

**Ramas:**
- `main` protegida: solo entra por PR, con 1 aprobación del otro dev.
- Nombres: `feat/api-x402-middleware`, `feat/web-freighter-connect`, `fix/...`, `docs/...`
- PR pequeños; en la descripción `Closes #<issue>` para que el tablero se mueva solo.
- Cambios a `packages/shared` o al contrato de API: avisar al otro dev antes de hacer merge.

**Sincronía:** check-in corto al inicio y al final de cada bloque de trabajo: qué terminé, qué sigue, qué me bloquea.

---

## 5. Riesgos

| Riesgo | Mitigación |
|---|---|
| Facilitador caído o lento en la demo | Modo `SELF_SETTLE` + video de respaldo |
| Onboarding de wallet (trustline, faucet) confunde al jurado | Wallet de demo pre-cargada + botón de preparación |
| Headers bloqueados por CORS | ADR-02, probarlo en F1 con dominios reales, no solo localhost |
| Contenido completo filtrado al cliente | ADR-03, revisar respuestas 402 en DevTools |
| Cambios de contrato rompen al otro dev | Tipos en `packages/shared` + aviso previo |
| Freighter móvil no soporta x402 | Demo en escritorio con la extensión |

---

## 6. Preguntas abiertas

1. ¿Fecha y hora límite de entrega del hackathon?
2. ¿"Lectura única" = acceso por 24 h o acceso permanente para esa wallet?
3. ¿Facilitador principal: OpenZeppelin o Coinbase?
4. ¿Se intenta el splitter on-chain (F4) o se queda off-chain?
5. ¿Nombres de Dev A y Dev B para asignar issues?

---

## Referencias

- [x402 en Stellar (Stellar Docs)](https://developers.stellar.org/docs/build/agentic-payments/x402)
- [Facilitador x402 de OpenZeppelin](https://docs.openzeppelin.com/relayer/guides/stellar-x402-facilitator-guide)
- [Spec x402](https://github.com/x402-foundation/x402)
- [Freighter API](https://docs.freighter.app)
