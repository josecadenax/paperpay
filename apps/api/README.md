# PaperPay Backend API (`@paperpay/api`)

Backend stateless con soporte para el protocolo **x402** sobre **Stellar Testnet**, desarrollado con Express y TypeScript en un monorepo pnpm.

---

## 🚀 Arranque Rápido para Dev B (Frontend)

### 1. Levantar el Backend Localmente
Desde la raíz del monorepo (`paperpay/`):

```bash
# 1. Instalar dependencias
pnpm install

# 2. Levantar la API en modo desarrollo (escucha en http://localhost:4000)
pnpm dev:api
```

### 2. Ejecutar Pruebas Automatizadas
```bash
# Correr la suite de 27 pruebas unitarias y de integración (Vitest)
pnpm test

# Correr la prueba en vivo contra Stellar Testnet (Friendbot + Horizon)
pnpm test:testnet
```

---

## 📡 Guía de Integración para el Frontend (`apps/web`)

### Endpoints Disponibles

| Método | Endpoint | Descripción | Respuesta esperada |
|---|---|---|---|
| `GET` | `/api/health` | Estado del backend y red activa | `200 OK` + `{ status: "ok", network: "stellar:testnet", treasuryPublicKey: "..." }` |
| `GET` | `/api/papers` | Catálogo de artículos disponibles | `200 OK` + `PaperPreview[]` |
| `GET` | `/api/papers/:id` | Consulta de artículo (protegido) | `402` si no hay pago / `200` si hay JWT o firma válida |

---

### Cómo Implementar el Flujo x402 en Next.js (Código de Referencia)

Puedes importar directamente los tipos y constantes desde `@paperpay/shared` en tu frontend:

```typescript
import { X402_HEADERS, PaperPreview, PaperFull, decodeBase64Json, encodeBase64Json } from '@paperpay/shared';
import { signAuthEntry } from '@stellar/freighter-api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// 1. Petición inicial (espera 402)
const response = await fetch(`${API_BASE}/api/papers/${paperId}`);

if (response.status === 402) {
  // 2. Extraer requerimientos de pago
  const rawHeader = response.headers.get('payment-required');
  const requirement = JSON.parse(atob(rawHeader)); // o decodeBase64Json
  const terms = requirement.accepts[0];
  // terms = { asset: "...", amount: "5000000", payTo: "...", network: "stellar:testnet" }

  // 3. Solicitar firma a Freighter
  // En la demo de hackathon, puedes pedir la firma de la auth entry o firmar con Freighter:
  const signatureResult = await signAuthEntry({ ... });

  // 4. Reintentar enviando la firma en la cabecera 'payment-signature'
  const unlockRes = await fetch(`${API_BASE}/api/papers/${paperId}`, {
    headers: {
      'payment-signature': btoa(JSON.stringify({
        scheme: 'exact',
        network: 'stellar:testnet',
        signerPublicKey: userPublicKey,
        signature: signatureResult,
      })),
    },
  });

  if (unlockRes.ok) {
    const data = await unlockRes.json();
    // data.paper -> Contenido completo del artículo (PaperFull)
    // data.accessToken -> Token JWT con vigencia de 24h
    // Guardar en localStorage para visitas futuras:
    localStorage.setItem(`paperpay:access:${paperId}`, data.accessToken);
  }
}
```

### Acceso con Sesión Previa (JWT)
Si el usuario ya compró el artículo en las últimas 24 horas:

```typescript
const token = localStorage.getItem(`paperpay:access:${paperId}`);

const res = await fetch(`${API_BASE}/api/papers/${paperId}`, {
  headers: token ? { Authorization: `Bearer ${token}` } : {},
});

// Si el token es válido, responde 200 OK directamente sin pedir pago
if (res.ok) {
  const { paper } = await res.json();
  // Mostrar paper.fullContentMarkdown
}
```

---

## 🔒 Variables de Entorno (`apps/api/.env`)

El archivo `.env` ya se autogenera con `pnpm --filter @paperpay/api generate:treasury`, pero si necesitas configurarlo manualmente, copia de `.env.example`:

* `PORT=4000`
* `STELLAR_NETWORK=testnet`
* `STELLAR_TREASURY_PUBLIC_KEY`: Clave pública de tesorería (recibe los 0.50 USDC).
* `SELF_SETTLE=false`: Si se activa en `true`, el servidor liquida con su clave de respaldo.
* `CORS_ORIGINS`: Incluye `http://localhost:3000` para desarrollo local y tu dominio de Vercel.
