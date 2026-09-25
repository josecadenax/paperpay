import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { x402Service } from '../../src/services/x402.service';
import { paymentVerificationService } from '../../src/services/payment-verification.service';
import { decodeBase64Json, encodeBase64Json } from '../../src/utils/base64';
import { jwtService } from '../../src/services/jwt.service';
import {
  X402PaymentRequiredHeader,
  X402PaymentResponseHeader,
  X402PaymentSignatureHeader,
} from '@paperpay/shared';

describe('Papers Controller & x402 Endpoints', () => {
  const targetPaperId = 'autonomous-ai-micropayments';

  describe('GET /api/health', () => {
    it('should return 200 OK and health info', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.network).toBe('stellar:testnet');
      expect(res.body.treasuryPublicKey).toBeDefined();
      expect(res.body.mode).toBeDefined();
    });
  });

  describe('GET /api/papers', () => {
    it('should return 200 OK and list of paper previews', async () => {
      const res = await request(app).get('/api/papers');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(3);

      const paper = res.body[0];
      expect(paper.id).toBeDefined();
      expect(paper.title).toBeDefined();
      expect(paper.priceUsdc).toBe(0.50);
      expect(paper.fullContentMarkdown).toBeUndefined();
    });
  });

  describe('GET /api/papers/:id - Stateless Paywall Flow', () => {
    it('should return 404 for a non-existent paper', async () => {
      const res = await request(app).get('/api/papers/non-existent-paper');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('PAPER_NOT_FOUND');
    });

    it('should return 402 Payment Required with base64 payment-required header when unauthenticated', async () => {
      const res = await request(app).get(`/api/papers/${targetPaperId}`);

      expect(res.status).toBe(402);

      // Check header
      const rawHeader = res.headers['payment-required'];
      expect(rawHeader).toBeDefined();

      const decoded = decodeBase64Json<X402PaymentRequiredHeader>(rawHeader);
      expect(decoded.accepts).toBeDefined();
      expect(decoded.accepts[0].scheme).toBe('exact');
      expect(decoded.accepts[0].network).toBe('stellar:testnet');
      expect(decoded.accepts[0].amount).toBe('5000000'); // 0.50 USDC

      // Security check: only preview, never full paper
      expect(res.body.preview).toBeDefined();
      expect(res.body.preview.id).toBe(targetPaperId);
      expect(res.body.paper).toBeUndefined();
      expect(res.body.fullContentMarkdown).toBeUndefined();

      // Check CORS exposed headers
      const exposedHeaders = res.headers['access-control-expose-headers'];
      expect(exposedHeaders).toContain('payment-required');
    });

    it('should return 200 OK and full paper when valid payment-signature is provided', async () => {
      const settlement = vi.spyOn(x402Service, 'settlePayment').mockResolvedValueOnce({ success: true, txHash: 'a'.repeat(64) });
      const signaturePayload: X402PaymentSignatureHeader = {
        scheme: 'exact',
        network: 'stellar:testnet',
        signerPublicKey: 'GB6XTESTLECTORUNAMWALLET402DEMO1234567890',
        signature: 'mock_soroban_authorization_entry_xdr',
      };

      const res = await request(app)
        .get(`/api/papers/${targetPaperId}`)
        .set('payment-signature', encodeBase64Json(signaturePayload));

      expect(res.status).toBe(200);

      // Verify payment-response header
      const rawResponseHeader = res.headers['payment-response'];
      expect(rawResponseHeader).toBeDefined();

      const paymentResponse = decodeBase64Json<X402PaymentResponseHeader>(rawResponseHeader);
      expect(paymentResponse.success).toBe(true);
      expect(paymentResponse.txHash).toBeDefined();

      // Verify response body
      expect(res.body.paper).toBeDefined();
      expect(res.body.paper.id).toBe(targetPaperId);
      expect(res.body.paper.fullContentMarkdown).toBeDefined();
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.txHash).toBe(paymentResponse.txHash);
      settlement.mockRestore();
    });

    it('should return 402 with error message if payment-signature is malformed', async () => {
      const res = await request(app)
        .get(`/api/papers/${targetPaperId}`)
        .set('payment-signature', 'malformed-unparseable-data');

      expect(res.status).toBe(402);
      expect(res.body.error).toBe('PAYMENT_FAILED');
    });

    it('should return 200 OK and full paper with valid Authorization: Bearer <jwt>', async () => {
      // Issue a valid token for target paper
      const token = jwtService.issueAccessToken({
        sub: 'GB6XTESTLECTORUNAMWALLET402DEMO1234567890',
        paperId: targetPaperId,
        txHash: 'tx_hash_sample_previously_settled',
      });

      const res = await request(app)
        .get(`/api/papers/${targetPaperId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.paper).toBeDefined();
      expect(res.body.paper.id).toBe(targetPaperId);
      expect(res.body.paper.fullContentMarkdown).toBeDefined();
    });

    it('should reject access with 402 if JWT belongs to a DIFFERENT paper', async () => {
      // Token issued for 'crispr-nanomedicine-biotech'
      const differentPaperToken = jwtService.issueAccessToken({
        sub: 'GB6XTESTLECTORUNAMWALLET402DEMO1234567890',
        paperId: 'crispr-nanomedicine-biotech',
        txHash: 'tx_hash_for_crispr',
      });

      // Requesting 'autonomous-ai-micropayments' with token from different paper
      const res = await request(app)
        .get(`/api/papers/${targetPaperId}`)
        .set('Authorization', `Bearer ${differentPaperToken}`);

      // Must NOT allow access -> responds with 402 Payment Required
      expect(res.status).toBe(402);
      expect(res.body.preview).toBeDefined();
      expect(res.body.paper).toBeUndefined();
    });

    it('should reject access with 402 if JWT is forged or tampered', async () => {
      const res = await request(app)
        .get(`/api/papers/${targetPaperId}`)
        .set('Authorization', 'Bearer forged.invalid.token');

      expect(res.status).toBe(402);
      expect(res.body.preview).toBeDefined();
      expect(res.body.paper).toBeUndefined();
    });
  });

  describe('POST /api/papers/:id/verify - Pollar payment flow', () => {
    const txHash = 'b'.repeat(64);
    const signerPublicKey = 'GCLIENTPOLLARTESTNETWALLET1234567890ABCDEF';
    const verificationHeader = {
      scheme: 'exact' as const,
      network: 'stellar:testnet' as const,
      txHash,
      signerPublicKey,
    };

    it('returns the paper and a JWT after an on-chain hash is verified', async () => {
      const verification = vi.spyOn(paymentVerificationService, 'verifyByHash').mockResolvedValueOnce({
        paperId: targetPaperId,
        signerPublicKey,
        txHash,
      });

      const res = await request(app)
        .post(`/api/papers/${targetPaperId}/verify`)
        .set('payment-signature', encodeBase64Json(verificationHeader))
        .send({ txHash, signerPublicKey });

      expect(res.status).toBe(200);
      expect(res.body.paper.id).toBe(targetPaperId);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.txHash).toBe(txHash);
      expect(verification).toHaveBeenCalledWith({ paperId: targetPaperId, signerPublicKey, txHash });
      verification.mockRestore();
    });

    it('rejects a body that differs from its payment-signature header', async () => {
      const res = await request(app)
        .post(`/api/papers/${targetPaperId}/verify`)
        .set('payment-signature', encodeBase64Json(verificationHeader))
        .send({ txHash: 'c'.repeat(64), signerPublicKey });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('PAYMENT_VERIFICATION_FAILED');
    });
  });
});
