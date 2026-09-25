import { STELLAR_NETWORK } from './constants';

export interface PaperPreview {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  publishedDate: string;
  publisher: string;
  doi?: string;
  priceUsdc: number;
  previewSnippet: string;
}

export interface PaperFull extends PaperPreview {
  fullContentMarkdown: string;
  pdfDownloadUrl?: string;
  references: string[];
}

export interface X402PaymentRequirement {
  scheme: 'exact';
  network: typeof STELLAR_NETWORK;
  asset: string;          // Contract address of USDC SAC
  amount: string;         // e.g. '5000000'
  payTo: string;          // Treasury public key
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
  signature: string;      // Facilitador: autorización; SELF_SETTLE: sobre de transacción XDR
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
  iat?: number;
  exp?: number;
}

export interface HealthCheckResponse {
  status: 'ok';
  network: typeof STELLAR_NETWORK;
  mode: 'FACILITATOR' | 'SELF_SETTLE';
  treasuryPublicKey: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
}
