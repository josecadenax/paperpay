export const STELLAR_NETWORK = 'stellar:testnet' as const;
export const STELLAR_NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';
export const STELLAR_HORIZON_URL = 'https://horizon-testnet.stellar.org';
export const STELLAR_RPC_URL = 'https://soroban-testnet.stellar.org';

// USDC SAC Contract ID en Stellar Testnet (SEP-41)
export const USDC_TESTNET_CONTRACT = 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA';

// Monto por lectura: $0.50 USDC = 5,000,000 stroops (7 decimales)
export const DEFAULT_PAPER_PRICE_USDC = 0.50;
export const DEFAULT_PAPER_PRICE_STROOPS = '5000000';

// Vigencia de acceso tras la compra
export const ACCESS_TOKEN_EXPIRATION_HOURS = 24;

// OpenZeppelin Facilitator en Testnet
export const OPENZEPPELIN_CHANNELS_TESTNET_URL = 'https://channels.openzeppelin.com/x402/testnet';

// Cabeceras HTTP estándar del protocolo x402
export const X402_HEADERS = {
  PAYMENT_REQUIRED: 'payment-required',
  PAYMENT_SIGNATURE: 'payment-signature',
  PAYMENT_RESPONSE: 'payment-response',
} as const;
