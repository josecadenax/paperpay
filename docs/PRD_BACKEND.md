# PaperPay · PRD (Product Requirements Document) - Backend API

> Requisitos propuestos. Para distinguir la implementación actual de lo pendiente consulta [QA.md](QA.md) y [apps/api/README.md](../apps/api/README.md).

* **Proyecto:** PaperPay
* **Componente:** Backend API (`apps/api`)
* **Responsable:** Dev A (Backend & Protocolo x402)
* **Evento:** Goya Hack 2026 (Track Stellar)
* **Fecha límite de entrega:** Viernes 25 de septiembre de 2026, 14:00 CDMX
* **Versión:** 1.0.0 (MVP)

---

## 1. Visión y Objetivos

### 1.1 Visión del Producto
El backend de **PaperPay** es un servicio API stateless de alto rendimiento diseñado para desacoplar el acceso a contenidos digitales protegidos (artículos científicos) mediante micropagos condicionales basados en el estándar abierto **HTTP 402 Payment Required** y el protocolo **x402** sobre **Stellar Soroban**.

### 1.2 Objetivos Clave del Backend
1. **Paywall Verdadero del Lado del Servidor:** Proteger el contenido completo de los artículos en el servidor; bajo ninguna circunstancia se debe enviar el texto íntegro en respuestas no autorizadas.
2. **Compatibilidad Estricta x402 v2:** Cumplir al 100% con la especificación de cabeceras (`PAYMENT-REQUIRED`, `PAYMENT-SIGNATURE`, `PAYMENT-RESPONSE`) y el esquema de autorización de Soroban (`AuthEntry`).
3. **Resiliencia Operativa:** Integrar liquidación vía Facilitador (OpenZeppelin Channels) y contar con un mecanismo de conmutación por fallo (*fallback*) mediante **`SELF_SETTLE`** directo en Stellar Testnet.
4. **Acceso Dual (Humanos y Agentes):** Permitir tanto el flujo web interactivo (Next.js + Freighter) como el consumo programático por agentes autónomos de IA vía API pura.

---

## 2. Personas y Casos de Uso

| Persona / Actor | Descripción | Caso de Uso Principal |
|---|---|---|
| **Lector Humano (Web)** | Estudiante o investigador navegando en `apps/web`. | Consulta el catálogo, solicita un paper, recibe el 402, envía la firma de Freighter y recibe el texto completo + JWT. |
| **Dev B (Frontend)** | Desarrollador de la interfaz de usuario. | Consume el backend bajo un contrato tipado, predecible y habilitado para CORS sin bloqueos. |
| **Agente de IA Autónomo** | Script o agente LLM que investiga bibliografía. | Realiza petición HTTP pura, detecta `402`, firma la transacción con su wallet y obtiene el contenido sin interfaz gráfica. |
| **Jurado de Goya Hack** | Evaluador técnico de Stellar y BAF. | Inspecciona la auditoría on-chain en Stellar.Expert y verifica la robustez técnica del middleware. |

---

## 3. Alcance (Scope)

### 3.1 Dentro del Alcance (MVP - Entrega Viernes 25)
* Servidor HTTP en **Node.js + Express + TypeScript**.
* Catálogo de 3 a 5 artículos de acceso abierto (arXiv / CC-BY) cargados desde archivo local `data/papers.json`.
* Endpoint público `GET /api/papers` para listado de artículos (solo metadatos y precio).
* Endpoint protegido `GET /api/papers/:id`:
  * Respuesta `402 Payment Required` con payload base64 en cabecera `PAYMENT-REQUIRED` si no hay credenciales.
  * Verificación y liquidación con `PAYMENT-SIGNATURE` contra el facilitador OpenZeppelin Channels.
  * Emisión de token JWT (duración de 24 horas) para accesos subsiguientes.
  * Acceso directo con `Authorization: Bearer <jwt>`.
* Mecanismo de respaldo `SELF_SETTLE=true` para transaccionar directamente con una cuenta fondeada de Stellar si el facilitador no responde.
* Configuración completa de CORS (exponiendo las cabeceras x402 requeridas por el navegador).
* Endpoint de diagnóstico y salud: `GET /api/health`.

### 3.2 Fuera del Alcance (Roadmap / Post-Hackathon)
* Base de datos relacional externa (PostgreSQL/MongoDB): el catálogo vive en memoria/JSON para eliminar dependencias en la demo.
* Smart contract Soroban Splitter 98/2 on-chain (Stretch goal; para el MVP la liquidación entra a la tesorería de PaperPay).
* Servicio de streaming o descarga de binarios PDF protegidos (Stretch goal).
* Panel de administración autenticado para editoriales (se muestra con datos mock en el frontend).

---

## 4. Requisitos Funcionales (RF)

* **RF-01 · Catálogo de Artículos:** El backend debe proveer la lista de artículos disponibles con ID, título, autores, resumen (*abstract*), fecha, editorial y precio fijo ($0.50 USDC).
* **RF-02 · Paywall Stateless (HTTP 402):** Al consultar `GET /api/papers/:id` sin autorización:
  * El código HTTP debe ser `402`.
  * La cabecera `PAYMENT-REQUIRED` debe contener un JSON en Base64 con el esquema x402 (`network`, `scheme`, `asset`, `amount: 5000000`, `payTo`, `maxTimeoutSeconds`).
  * El cuerpo HTTP solo debe contener el `preview` (metadatos y primeras 250 palabras difuminadas o fragmento).
* **RF-03 · Procesamiento de Pago x402:**
  * Al recibir `GET /api/papers/:id` con la cabecera `PAYMENT-SIGNATURE`, el backend debe decodificar la `AuthEntry` de Soroban.
  * Debe enviar la transacción al Facilitador de OpenZeppelin en Stellar Testnet.
  * Si es exitosa, debe responder `200 OK`, incluir la cabecera `PAYMENT-RESPONSE` con el hash de la transacción (`txHash`) y devolver el objeto `paper` completo junto con un `accessToken`.
* **RF-04 · Modo de Respaldo (`SELF_SETTLE`):** Si `SELF_SETTLE=true` en las variables de entorno o si el facilitador falla, el backend debe armar la transacción de Soroban, firmar la envolvente con su clave secreta operativa (`STELLAR_BACKUP_SECRET_KEY`) y enviarla directamente a Stellar Horizon/RPC.
* **RF-05 · Sesión Stateless vía JWT:**
  * Al liquidar exitosamente, el backend emite un JWT firmado con `JWT_SECRET`.
  * Claims obligatorios: `sub` (dirección pública del lector), `paperId`, `txHash`, `iat`, `exp` (24 horas).
  * Si la petición incluye `Authorization: Bearer <jwt>` válido y el `paperId` coincide, el servidor debe responder `200 OK` inmediatamente sin solicitar cobro.
* **RF-06 · Habilitación de CORS:** El servidor debe exponer explícitamente `PAYMENT-REQUIRED` y `PAYMENT-RESPONSE` mediante `Access-Control-Expose-Headers` y admitir `PAYMENT-SIGNATURE` y `Authorization` en `Access-Control-Allow-Headers`.
* **RF-07 · Respuestas de Error Estandarizadas:** Formato JSON claro ante firmas expiradas, fondos insuficientes o parámetros inválidos, con mensajes legibles para la interfaz de usuario.

---

## 5. Requisitos No Funcionales (RNF)

* **RNF-01 · Latencia:** La respuesta `402` inicial debe tomar `< 50ms`. La liquidación completa x402 debe responder en `< 5 segundos` (dependiente del tiempo de cierre de ledger de Stellar).
* **RNF-02 · Disponibilidad:** El backend se desplegará en Railway para garantizar que el proceso no se suspenda por inactividad durante la demo del jurado.
* **RNF-03 · Seguridad de Claves:** Ninguna clave privada o secreta de tesorería debe incluirse en el repositorio. Toda configuración se inyectará por variables de entorno.
* **RNF-04 · Tipado Estricto:** Código 100% TypeScript sin uso de `any` en los contratos públicos.

---

## 6. Criterios de Aceptación (Definition of Done)

1. `curl -i http://localhost:4000/api/papers/p-01` devuelve cabecera `HTTP/1.1 402 Payment Required` y cabecera `payment-required`.
2. Una petición con firma válida liquida en Stellar Testnet y devuelve `200 OK`, el texto completo y un `txHash` rastreable en `https://stellar.expert/explorer/testnet/tx/<txHash>`.
3. Una petición subsecuente con el JWT generado devuelve `200 OK` sin requerir nuevo pago.
4. El backend se ejecuta tanto en modo Facilitador como en modo `SELF_SETTLE=true`.
