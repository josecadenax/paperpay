<p align="center"><img src="apps/web/public/brand/paperpay-logo.svg" alt="PaperPay" height="56"></p>

# PaperPay

> Paga $0.50 USDC por leer un artículo científico. Un clic, sin cuenta, liquidado en Stellar en menos de 5 segundos.

Propuesta de dos exalumnos de la Facultad de Ingeniería de la UNAM para **Goya Hack 2026** ([criptounam.xyz](https://criptounam.xyz/hackathon)) · Track **Stellar**.

> 📅 Entrega: **viernes 25 sep 2026, 14:00 CDMX** · Tablero: [GitHub Project](https://github.com/users/josecadenax/projects/2) · Plan: [docs/PLAN.md](docs/PLAN.md)

---

## El problema

Las editoriales académicas (Elsevier, Springer, etc.) cobran entre **$30 y $50 USD** por descargar un solo PDF. Las suscripciones son caras para lectores ocasionales, y las pasarelas tradicionales (Stripe, tarjetas) no permiten cobrar centavos porque su comisión fija (~$0.30 + 2.9%) se come el pago.

## La solución

PaperPay es un paywall **stateless** basado en el estándar `HTTP 402 Payment Required` y el protocolo abierto **[x402](https://x402.org)** sobre **Stellar Testnet**:

1. El lector abre un artículo y ve el resumen; el resto aparece difuminado.
2. El servidor responde `402` con las condiciones de pago ($0.50 USDC, destino, red).
3. El lector firma con **Freighter Wallet** (un clic). No hay email ni contraseña.
4. El pago se liquida en Stellar (comisión de red ~$0.0005 que paga el facilitador, no el lector).
5. El servidor entrega el artículo completo + un token de acceso (JWT) ligado a la wallet y al artículo.

## Modelo de negocio

- **Fee de infraestructura:** 1.5% a 2% por micro-transacción procesada.
- **SaaS / Dashboard:** licencia para revistas independientes y universidades (publicar artículos, fijar precio, ver ingresos).

---

## Arquitectura

```
┌──────────────────────┐        GET /api/papers/:id          ┌──────────────────────┐
│  apps/web (Next.js)  │ ──────────────────────────────────▶ │  apps/api (Express)  │
│  Tailwind + Freighter│ ◀─── 402 + PAYMENT-REQUIRED ──────── │  middleware x402     │
│                      │                                      │                      │
│  firma auth entry    │        GET + PAYMENT-SIGNATURE       │  verify / settle     │──┐
│  con Freighter       │ ──────────────────────────────────▶ │                      │  │
│                      │ ◀─── 200 + PAYMENT-RESPONSE + JWT ── │  emite JWT           │  │
└──────────────────────┘        + contenido completo          └──────────────────────┘  │
                                                                                         ▼
                                                              ┌──────────────────────────────┐
                                                              │ Facilitador x402 (testnet)   │
                                                              │ verifica firma, envía la tx  │
                                                              │ a Soroban y paga el fee      │
                                                              └──────────────┬───────────────┘
                                                                             ▼
                                                              ┌──────────────────────────────┐
                                                              │ Stellar Testnet · USDC SAC   │
                                                              │ transfer(lector → PaperPay)  │
                                                              └──────────────────────────────┘
```

| Capa | Stack | Responsable |
|---|---|---|
| Frontend | Next.js, React, Tailwind, `@stellar/freighter-api` | Dev B |
| Backend | Node.js, Express, TypeScript, `@stellar/stellar-sdk`, `@x402/express`, `@x402/stellar` | Dev A |
| Contrato compartido | Tipos TS y ejemplos de payload en `packages/shared` | Ambos |
| Red | Stellar Testnet (`stellar:testnet`), USDC SEP-41 | n/a |

Resumen para mentores y jurado: **[docs/RESUMEN_EJECUTIVO.md](docs/RESUMEN_EJECUTIVO.md)** · Detalle técnico: **[docs/PLAN.md](docs/PLAN.md)** · Flujo de compra: **[docs/FLUJO_USUARIO.md](docs/FLUJO_USUARIO.md)** · Backend: **[PRD](docs/PRD_BACKEND.md)** y **[TDD](docs/TDD_BACKEND.md)**.

---

## Estructura del repo (propuesta)

```
paperpay/
├── apps/
│   ├── api/          # Express + x402 (Dev A)
│   └── web/          # Next.js + Freighter (Dev B)
├── packages/
│   └── shared/       # tipos, constantes de red, contrato de API
├── docs/
│   └── PLAN.md
└── README.md
```

Monorepo con **pnpm workspaces** para que ambos devs compartan tipos sin publicar paquetes.

---

## Requisitos para probar la demo

1. Extensión **Freighter** (navegador, no móvil) en modo **Testnet**.
2. Cuenta de testnet fondeada con XLM ([Friendbot](https://laboratory.stellar.org/#account-creator?network=test)).
3. Trustline a USDC de testnet + saldo desde el [faucet de Circle](https://faucet.circle.com) (red Stellar Testnet).

> Esto se documentará paso a paso (o se automatizará con un botón "Preparar wallet de demo") antes del pitch.

## Entornos y URLs
- **Backend API (Producción):** `https://paperpay-backend-production.up.railway.app`
- **Documentación API:** Puedes hacer `GET /api/papers` a esa URL para ver los artículos.

## Arranque local (Si deseas desarrollar el backend)

### 1. Requisitos
- Node.js >= 20
- pnpm >= 9 (`npm install -g pnpm`)

### 2. Instalación y ejecución
```bash
# 1. Instalar dependencias en todo el monorepo
pnpm install

# 2. Generar y fondear cuenta de tesorería en Stellar Testnet (crea .env)
pnpm --filter @paperpay/api generate:treasury

# 3. Levantar la API del backend (:4000)
pnpm dev:api

# O levantar todos los servicios en paralelo
pnpm dev
```

### 3. Pruebas automatizadas
```bash
# Ejecutar suite de 27 pruebas unitarias y de integración (Vitest)
pnpm test

# Ejecutar prueba en vivo contra Stellar Testnet (Friendbot + Horizon)
pnpm test:testnet
```

Guía de integración para frontend: **[apps/api/README.md](apps/api/README.md)**.

---

## Equipo

| Rol | Persona | Área |
|---|---|---|
| Dev A | _por definir_ | Backend y protocolo x402 |
| Dev B | _por definir_ | Frontend, UX y wallet |

## Licencia

Por definir (sugerido: MIT para el código; los artículos de la demo deben ser open access, p. ej. arXiv / CC-BY).
