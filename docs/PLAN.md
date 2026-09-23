# PaperPay: Arquitectura y plan de trabajo

Documento vivo. Si una decisión cambia, se edita aquí en el mismo PR que la implementa.

---

## 0. Contexto del hackathon (Goya Hack 2026)

Bases: [criptounam.xyz/hackathon](https://criptounam.xyz/hackathon)

| Dato | Valor |
|---|---|
| Evento | Goya Hack · Facultad de Ingeniería UNAM · 22 al 25 sep 2026, híbrido |
| **Deadline** | **Viernes 25 sep, 14:00 hora CDMX** |
| Entrega | Desde el panel del hacker: **repo + demo + video** |
| Clausura | Viernes 25 sep, 18:00 |
| Track objetivo | **Stellar** (con BAF): 1.º $150 · 2.º $100 · 3.º $80 USD + aceleradora Instaward |
| Otros premios posibles | Pollar: bolsa de $200 para quien lo integre (stretch) |

### ⚠️ Requisito obligatorio de Tangem (cada integrante)

Sin esto no se puede entregar ni optar a premios. Aplica a Dev A y Dev B por separado:

1. Descargar la app de Tangem **solo desde el enlace o QR de la página** (join.tangem.com). Si se instala desde App Store o Google Play no cuenta; si ya estaba instalada, desinstalar y reinstalar desde el enlace.
2. Crear la wallet (guardar la frase de recuperación).
3. Activar la tarjeta en línea TangemPay dentro de la app y completar KYC con identificación oficial vigente.

Tangem **no** es la wallet de pago de PaperPay: el flujo x402 requiere firmar auth entries de Soroban, que hoy soportan Freighter (extensión) y otras wallets de la lista oficial de Stellar, no Tangem.

### Cómo califican (4 ejes) y cómo lo atacamos

| Eje | Nuestra respuesta |
|---|---|
| Implementación técnica (código, arquitectura, smart contracts) | x402 v2 estándar sobre Soroban, monorepo tipado, contrato de API congelado |
| Innovación y creatividad | HTTP 402 real en la web académica; mismo endpoint sirve a humanos y a agentes de IA |
| Impacto social y usabilidad (incluye comunidad UNAM) | Estudiantes UNAM pagan $0.50 por artículo en vez de $30 a $50; 1 clic, sin cuenta |
| Demo funcional sin fallos + pitch | Wallet de demo precargada, modo `SELF_SETTLE` de respaldo y video grabado |

### Pendiente con la organización

- Confirmar elegibilidad: las bases dicen "abierto a estudiantes de cualquier universidad". Si vamos como CellarTech, confirmar que se permite o registrar el equipo a nombre de los devs.
- Preguntar si un proyecto puede competir en dos tracks (Stellar + AI).

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

## 3. Plan de tareas (47 h: mié 23 tarde → vie 25 14:00)

Leyenda: 🅰️ Dev A (backend) · 🅱️ Dev B (frontend) · 🤝 ambos. Cada tarea es un issue en GitHub; la fecha es la del milestone.

| Fase | Cierre | Objetivo |
|---|---|---|
| F0 Setup | **Mié 23, 22:00** | Repo corriendo, contrato congelado, wallets listas, Tangem cumplido |
| F1 Core | **Jue 24, 14:00** | Backend responde 402 y liquida; frontend muestra paywall contra mock |
| F2 Integración | **Jue 24, 23:00** | Pago real end-to-end desplegado |
| F3 Demo | **Vie 25, 12:00** | Video, slides, README y entrega (2 h de colchón antes del deadline) |
| F4 Stretch | Solo si sobra tiempo | Nada de aquí bloquea la entrega |

### F0 · Setup y contrato (mié 23, 22:00)
- [ ] 🤝 **Requisito Tangem cumplido por ambos** (app desde el enlace oficial + wallet + TangemPay con KYC)
- [ ] 🤝 Registrar equipo en el panel de Goya Hack y confirmar elegibilidad / track Stellar
- [ ] 🤝 Monorepo pnpm: `apps/api`, `apps/web`, `packages/shared` + `.env.example`
- [ ] 🤝 Tipos, constantes y contrato de API congelados en `packages/shared` (sección 2)
- [ ] 🤝 Wallets testnet: tesorería (payTo) y lector de demo con trustline USDC + faucet
- [ ] 🅰️ API key del facilitador OpenZeppelin (testnet)

### F1 · Backend x402 (🅰️, jue 24 14:00)
- [ ] Express + TS con CORS de headers x402 (ADR-02)
- [ ] Catálogo `papers.json` con 3 a 5 artículos open access; `GET /api/papers`
- [ ] `GET /api/papers/:id` con 402 + `PAYMENT-REQUIRED` y solo preview (ADR-03)
- [ ] Middleware `@x402/express` + `@x402/stellar` con verify/settle vía facilitador
- [ ] Emisión y validación de JWT (ADR-04)
- [ ] Deploy del API (Render / Railway / Fly)

### F1 · Frontend (🅱️, jue 24 14:00, en paralelo contra mock)
- [ ] Next.js + Tailwind: layout "revista científica" + catálogo
- [ ] Vista de artículo con blur paywall + CTA "Leer por $0.50 USDC"
- [ ] Conexión Freighter: detectar extensión, `requestAccess`, validar red Testnet
- [ ] Mock del API según el contrato
- [ ] Deploy en Vercel

### F2 · Integración end-to-end (jue 24 23:00)
- [ ] 🅱️ Flujo 402 → firma Freighter (`signAuthEntry`) → reintento con `PAYMENT-SIGNATURE`
- [ ] 🅱️ Desbloqueo animado + JWT en `localStorage` + link a stellar.expert con el txHash
- [ ] 🅰️ Modo `SELF_SETTLE` de respaldo (ADR-01)
- [ ] 🤝 Pruebas de casos de error con mensajes humanos (sin Freighter, red equivocada, sin trustline, sin saldo, firma cancelada, JWT expirado)

### F3 · Demo y entrega (vie 25 12:00)
- [ ] 🅱️ Pantalla estática de editorial: ventas, ingresos, fee PaperPay (sin backend)
- [ ] 🤝 Wallet de demo precargada + guía de preparación en el README
- [ ] 🤝 Video de demo (flujo completo + txHash en explorer)
- [ ] 🤝 Slides del pitch: problema → demo → impacto UNAM → modelo de negocio → roadmap
- [ ] 🤝 README final con capturas, URLs y cómo correrlo
- [ ] 🤝 **Entregar en el panel antes del viernes 14:00** (repo + demo + video)

### F4 · Stretch (solo si sobra tiempo; si no, van como roadmap en slides)
- [ ] Integrar Pollar smart wallets como segunda opción de pago (bolsa de $200)
- [ ] Agentes de IA pagando vía x402 (mismo endpoint, sin UI)
- [ ] Contrato Soroban splitter 98/2 (ADR-06)
- [ ] Descarga de PDF protegido

---

## 4. Flujo de trabajo en GitHub

**Tablero:** [GitHub Project "PaperPay · Goya Hack"](https://github.com/users/josecadenax/projects/2) con vista board `Todo · In progress · Done`. Cada tarea de la sección 3 es un **issue**.

- **Labels:** `backend`, `frontend`, `shared`, `infra`, `demo`, `blocker`, `stretch`
- **Milestones:** `F0 Setup`, `F1 Core`, `F2 Integración`, `F3 Demo`, `F4 Stretch` (con fecha)
- **Asignación:** cada issue tiene un solo responsable. Quien toma un issue se lo asigna y lo mueve a In progress.

**Ramas:**
- `main` protegida: solo entra por PR, con 1 aprobación del otro dev (en F2 y F3 se vale auto-merge si el otro está ocupado, avisando).
- Nombres: `feat/api-x402-middleware`, `feat/web-freighter-connect`, `fix/...`, `docs/...`
- PR pequeños; en la descripción `Closes #<issue>` para que el tablero se mueva solo.
- Cambios a `packages/shared` o al contrato de API: avisar al otro dev antes de hacer merge.

**Sincronía:** check-in de 5 minutos al cierre de cada fase: qué terminé, qué sigue, qué me bloquea.

---

## 5. Riesgos

| Riesgo | Mitigación |
|---|---|
| No cumplir el requisito Tangem = descalificación | Primera tarea de F0, hacerlo hoy |
| Facilitador caído o lento en la demo | Modo `SELF_SETTLE` + video de respaldo |
| Onboarding de wallet (trustline, faucet) confunde al jurado | Wallet de demo precargada |
| Headers bloqueados por CORS | ADR-02, probar con dominios desplegados, no solo localhost |
| Contenido completo filtrado al cliente | ADR-03, revisar respuestas 402 en DevTools |
| Cambios de contrato rompen al otro dev | Tipos en `packages/shared` + aviso previo |
| Freighter móvil no soporta x402 | Demo en escritorio con la extensión |
| Entregar tarde | Milestone F3 cierra a las 12:00, 2 h antes del deadline |

---

## 6. Preguntas abiertas

1. ~~¿Fecha límite?~~ Viernes 25 sep, 14:00 CDMX.
2. ¿"Lectura única" = acceso por 24 h o permanente para esa wallet? (propuesta: 24 h)
3. ¿Facilitador principal: OpenZeppelin o Coinbase? (propuesta: OpenZeppelin)
4. ¿Elegibilidad como empresa y posibilidad de doble track? (preguntar en el tablón de dudas)
5. ¿Nombres/usuarios de GitHub de Dev A y Dev B para asignar issues?

---

## Referencias

- [x402 en Stellar (Stellar Docs)](https://developers.stellar.org/docs/build/agentic-payments/x402)
- [Facilitador x402 de OpenZeppelin](https://docs.openzeppelin.com/relayer/guides/stellar-x402-facilitator-guide)
- [Spec x402](https://github.com/x402-foundation/x402)
- [Freighter API](https://docs.freighter.app)
