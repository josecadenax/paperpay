# PaperPay · TDD (Technical Design Document) - Backend API

> Diseño propuesto. La firma con Freighter y la liquidación real no están verificadas; consulta [QA.md](QA.md) y [apps/api/README.md](../apps/api/README.md).

* **Proyecto:** PaperPay
* **Componente:** Backend API (`apps/api`) & Shared Contract (`packages/shared`)
* **Responsable:** Dev A (Backend & Protocolo x402)
* **Fecha:** 23 de septiembre de 2026
* **Versión:** 1.0.0 (MVP)

---

## 1. Arquitectura del Sistema

El backend es un microservicio HTTP desarrollado en **Node.js + Express** con **TypeScript**, estructurado bajo una arquitectura modular desacoplada por capas:

```
                      [ Petición HTTP ]
                              │
                              ▼
                   ┌─────────────────────┐
                   │    corsMiddleware   │  (Expone PAYMENT-REQUIRED, etc.)
                   └──────────┬──────────┘
                              ▼
                   ┌─────────────────────┐
                   │   jwtAuthMiddleware │  (Verifica Bearer token opcional)
                   └──────────┬──────────┘
                              ▼
             ┌─────────────────────────────────┐
             │ ¿Tiene JWT válido para paperId? │
             └────────┬───────────────┬────────┘
                   SÍ │               │ NO
                      ▼               ▼
         ┌───────────────────┐ ┌──────────────────────────────────────┐
         │ Retorna PaperFull │ │ ¿Tiene cabecera PAYMENT-SIGNATURE?   │
         │     (200 OK)      │ └───────┬──────────────────────┬───────┘
         └───────────────────┘      SÍ │                      │ NO
                                       ▼                      ▼
                           ┌──────────────────────┐ ┌──────────────────────┐
                           │   x402 Settlement    │ │ Retorna 402 +        │
                           │  (Facilitator /      │ │ PAYMENT-REQUIRED +   │
                           │   SELF_SETTLE)       │ │ PaperPreview         │
                           └──────────┬───────────┘ └──────────────────────┘
                                      ▼
                           ┌──────────────────────┐
                           │ Emite JWT (24h) +    │
                           │ PAYMENT-RESPONSE +   │
                           │ PaperFull (200 OK)   │
                           └──────────────────────┘
```

---

## 2. Estructura de Archivos

```text
paperpay/
├── packages/
│   └── shared/                       # Código y tipos compartidos
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts              # Exportaciones públicas
│           ├── constants.ts          # Red, contrato USDC, precios
│           └── types.ts              # Interfaces Paper, x402 y JWT
└── apps/
    └── api/                          # Backend Express
        ├── package.json
        ├── tsconfig.json
        ├── .env.example
        ├── data/
        │   └── papers.json           # Catálogo de 3-5 artículos
        └── src/
            ├── index.ts              # Punto de entrada y servidor HTTP
            ├── config.ts             # Carga y validación de variables de entorno
            ├── controllers/
            │   └── papers.controller.ts
            ├── middlewares/
            │   ├── cors.middleware.ts
            │   ├── jwt.middleware.ts
            │   └── x402.middleware.ts
            ├── services/
            │   ├── papers.service.ts
            │   ├── jwt.service.ts
            │   ├── facilitator.service.ts
            │   └── self-settle.service.ts
            └── utils/
                └── base64.ts
```

---

## 3. Dependencias Principales

| Paquete | Versión Sugerida | Propósito |
|---|---|---|
| `express` | `^4.21.0` | Framework web HTTP. |
| `@types/express` | `^4.17.21` | Tipos para Express. |
| `cors` | `^2.8.5` | Configuración de cabeceras Cross-Origin. |
| `@stellar/stellar-sdk` | `^13.0.0` | Manejo de transacciones, cuentas y Soroban RPC. |
| `@x402/express` | `^2.0.0` | Middleware oficial del protocolo x402 para Express. |
| `@x402/stellar` | `^2.0.0` | Adaptador del esquema Stellar para x402. |
| `jsonwebtoken` | `^9.0.2` | Firma y verificación de tokens de acceso (JWT). |
| `zod` | `^3.23.8` | Validación de variables de entorno y payloads. |
| `dotenv` | `^16.4.5` | Inyección de variables de entorno locales. |

---

## 4. Modelos de Datos y Tipos (`packages/shared`)

### 4.1 Constantes de Red (`constants.ts`)
```typescript
export const STELLAR_NETWORK = 'stellar:testnet';
export const STELLAR_NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';
export const STELLAR_HORIZON_URL = 'https://horizon-testnet.stellar.org';
export const STELLAR_RPC_URL = 'https://soroban-testnet.stellar.org';

// USDC SAC Contract ID en Stellar Testnet
export const USDC_TESTNET_CONTRACT = 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA';

// Monto por lectura: $0.50 USDC = 5,000,000 stroops (7 decimales)
export const DEFAULT_PAPER_PRICE_USDC = 0.50;
export const DEFAULT_PAPER_PRICE_STROOPS = '5000000';
export const ACCESS_TOKEN_EXPIRATION_HOURS = 24;
```

### 4.2 Interfaces de Artículos (`types.ts`)
```typescript
export interface PaperPreview {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  publishedDate: string;
  publisher: string;
  doi?: string;
  priceUsdc: number;
  previewSnippet: string; // Primeras 250 palabras
}

export interface PaperFull extends PaperPreview {
  fullContentMarkdown: string; // Texto íntegro del artículo
  pdfDownloadUrl?: string;
  references: string[];
}
```

### 4.3 Esquemas de Cabeceras x402 v2
```typescript
export interface X402PaymentRequirement {
  scheme: 'exact';
  network: typeof STELLAR_NETWORK;
  asset: string;          // USDC SAC Contract ID
  amount: string;         // '5000000'
  payTo: string;          // Clave pública de la tesorería de PaperPay
  maxTimeoutSeconds: number;
  extra?: {
    paperId: string;
    title: string;
  };
}

export interface X402PaymentRequiredHeader {
  accepts: X402PaymentRequirement[];
}

export interface X402PaymentSignatureHeader {
  scheme: 'exact';
  network: typeof STELLAR_NETWORK;
  signature: string;      // Base64 xdr.SorobanAuthorizationEntry firmada
  signerPublicKey: string;// G...
}

export interface X402PaymentResponseHeader {
  success: boolean;
  txHash: string;
  settledAt: string;
}

export interface JWTAccessTokenClaims {
  sub: string;            // Public key del lector
  paperId: string;
  txHash: string;
  iat: number;
  exp: number;
}
```

---

## 5. Especificación de Endpoints

### 5.1 `GET /api/health`
* **Respuesta `200 OK`:**
  ```json
  {
    "status": "ok",
    "network": "stellar:testnet",
    "mode": "FACILITATOR", // o "SELF_SETTLE"
    "treasuryPublicKey": "GB6X...402A",
    "timestamp": "2026-09-23T21:00:00Z"
  }
  ```

### 5.2 `GET /api/papers`
* **Respuesta `200 OK`:** Lista de objetos `PaperPreview`.

### 5.3 `GET /api/papers/:id`
* **Caso 1: Sin credenciales ni pago**
  * **HTTP Status:** `402 Payment Required`
  * **Cabecera `PAYMENT-REQUIRED`:** JSON serializado en Base64 conforme a `X402PaymentRequiredHeader`.
  * **Body:**
    ```json
    {
      "preview": { ...PaperPreview... }
    }
    ```

* **Caso 2: Con cabecera `Authorization: Bearer <jwt>` válida**
  * **HTTP Status:** `200 OK`
  * **Body:**
    ```json
    {
      "paper": { ...PaperFull... }
    }
    ```

* **Caso 3: Con cabecera `PAYMENT-SIGNATURE` válida**
  * **Acción:** Verifica y liquida la transacción en Stellar.
  * **HTTP Status:** `200 OK`
  * **Cabecera `PAYMENT-RESPONSE`:** JSON serializado en Base64 con `{ "success": true, "txHash": "..." }`.
  * **Body:**
    ```json
    {
      "paper": { ...PaperFull... },
      "accessToken": "eyJhbGciOi...",
      "txHash": "a1b2c3d4..."
    }
    ```

* **Caso 4: Firma inválida / Error de liquidación**
  * **HTTP Status:** `402 Payment Required` o `400 Bad Request`
  * **Body:**
    ```json
    {
      "error": "SETTLEMENT_FAILED",
      "message": "Saldo insuficiente de USDC en la cuenta o firma expirada."
    }
    ```

---

## 6. Integración del Protocolo x402 y Liquidación

### 6.1 Modo Facilitador (Primario)
1. El backend recibe la `AuthEntry` firmada enviada por Freighter.
2. Realiza un `POST` al endpoint del facilitador OpenZeppelin Channels (`https://channels.openzeppelin.com/x402/testnet`) con la API Key configurada.
3. El facilitador:
   * Valida la firma del lector sobre la autorización de transferencia de Soroban.
   * Envuelve la operación en una transacción patrocinando el fee en XLM.
   * La envía al RPC de Soroban y retorna el `txHash`.
4. El backend emite el JWT y libera el contenido.

### 6.2 Modo de Respaldo `SELF_SETTLE`
Si `SELF_SETTLE=true` o si el facilitador devuelve timeout/error 5xx:
1. El backend utiliza `@stellar/stellar-sdk` con su propia clave privada (`STELLAR_BACKUP_SECRET_KEY`).
2. Construye una transacción invocando el contrato de USDC SAC (`transfer(lector, payTo, 5000000)`).
3. Adjunta la `SorobanAuthorizationEntry` firmada por el usuario como autorización externa.
4. El backend firma como `sourceAccount` (pagando el fee de 0.0024 XLM de su propio saldo).
5. Envía la transacción a `soroban-testnet.stellar.org` y espera el resultado del ledger.

---

## 7. Configuración y Variables de Entorno (`.env.example`)

```env
PORT=4000
NODE_ENV=development

# Configuración de Stellar
STELLAR_NETWORK=testnet
STELLAR_TREASURY_PUBLIC_KEY=G...      # Wallet que recibe los 0.50 USDC
STELLAR_BACKUP_SECRET_KEY=S...        # Solo para modo SELF_SETTLE (cuenta con XLM)
SELF_SETTLE=false

# Facilitador OpenZeppelin
OPENZEPPELIN_CHANNELS_URL=https://channels.openzeppelin.com/x402/testnet
OPENZEPPELIN_API_KEY=oz_test_...

# Autenticación JWT
JWT_SECRET=super-secreto-para-el-hackathon-goya-2026

# Orígenes CORS permitidos (separados por coma)
CORS_ORIGIN=http://localhost:3000,https://paperpay.vercel.app
```

---

## 8. Estrategia de Pruebas (Testing)

1. **Prueba Unitaria de Contrato:** Validar que `GET /api/papers/:id` emita exactamente las cabeceras requeridas con Base64 decodificable.
2. **Prueba de JWT:** Validar expiración y rechazo si el `paperId` del token no coincide con el recurso solicitado.
3. **Spike de Testnet:** Script independiente (`scripts/test-settle.ts`) que firme con un Keypair de prueba y verifique la transferencia de 0.50 USDC en Horizon.
