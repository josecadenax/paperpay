import { describe, it, expect } from 'vitest';
import { x402Service } from '../../src/services/x402.service';
import { encodeBase64Json } from '../../src/utils/base64';
import {
  DEFAULT_PAPER_PRICE_STROOPS,
  STELLAR_NETWORK,
  USDC_TESTNET_CONTRACT,
  X402PaymentSignatureHeader,
} from '@paperpay/shared';

describe('X402Service', () => {
  it('should create valid payment requirement payload matching x402 v2 spec', () => {
    const requirement = x402Service.createPaymentRequirement(
      'autonomous-ai-micropayments',
      'Autonomous Agentic Payments'
    );

    expect(requirement.accepts).toHaveLength(1);
    const req = requirement.accepts[0];
    expect(req.scheme).toBe('exact');
    expect(req.network).toBe(STELLAR_NETWORK);
    expect(req.asset).toBe(USDC_TESTNET_CONTRACT);
    expect(req.amount).toBe(DEFAULT_PAPER_PRICE_STROOPS); // '5000000' = 0.50 USDC
    expect(req.payTo).toBeDefined();
    expect(req.maxTimeoutSeconds).toBe(300);
    expect(req.extra?.paperId).toBe('autonomous-ai-micropayments');
  });

  it('should parse base64 signature header correctly', () => {
    const original: X402PaymentSignatureHeader = {
      scheme: 'exact',
      network: 'stellar:testnet',
      signerPublicKey: 'GDEMOLECTORUNAMTESTNETWALLET1234567890ABCDEF',
      signature: 'mock_soroban_authorization_entry_xdr_base64',
    };

    const b64 = encodeBase64Json(original);
    const parsed = x402Service.parseSignatureHeader(b64);

    expect(parsed).toEqual(original);
  });

  it('should parse raw JSON string signature header as fallback', () => {
    const original: X402PaymentSignatureHeader = {
      scheme: 'exact',
      network: 'stellar:testnet',
      signerPublicKey: 'GDEMOLECTORUNAMTESTNETWALLET1234567890ABCDEF',
      signature: 'mock_soroban_authorization_entry_xdr_base64',
    };

    const parsed = x402Service.parseSignatureHeader(JSON.stringify(original));
    expect(parsed).toEqual(original);
  });

  it('should throw an error on malformed signature header', () => {
    expect(() => x402Service.parseSignatureHeader('not valid base64 or json!')).toThrow();
  });

  it('should settle payment and return txHash in test/demo mode', async () => {
    const signaturePayload: X402PaymentSignatureHeader = {
      scheme: 'exact',
      network: 'stellar:testnet',
      signerPublicKey: 'GDEMOLECTORUNAMTESTNETWALLET1234567890ABCDEF',
      signature: 'mock_signature_data',
    };

    const result = await x402Service.settlePayment(signaturePayload, 'autonomous-ai-micropayments');
    expect(result.success).toBe(true);
    expect(result.txHash).toBeDefined();
    expect(typeof result.txHash).toBe('string');
  });

  it('should reject settlement if signature or signer is missing', async () => {
    const invalidPayload = {
      scheme: 'exact',
      network: 'stellar:testnet',
      signerPublicKey: '',
      signature: '',
    } as X402PaymentSignatureHeader;

    await expect(
      x402Service.settlePayment(invalidPayload, 'autonomous-ai-micropayments')
    ).rejects.toThrow();
  });
});
