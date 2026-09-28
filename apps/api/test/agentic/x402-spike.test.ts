import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { paymentMiddlewareFromConfig } from '@x402/express';
import { x402HTTPClient } from '@x402/fetch';
import { ExactStellarScheme } from '@x402/stellar/exact/server';
import type { FacilitatorClient } from '@x402/core/server';

// AP-00: contract spike only. The fake facilitator advertises the same scheme
// as the public Testnet facilitator, but cannot authorize or move funds.
const testnetSupport = {
  kinds: [{
    x402Version: 2,
    scheme: 'exact',
    network: 'stellar:testnet',
    extra: { areFeesSponsored: true },
  }],
  extensions: [],
  signers: { 'stellar:*': ['GC6CSXBV4C6RL3HEDTW57KXYXSSXKAWKGYDEOSATXM3XNKXSR2VRYN3K'] },
} as const;

const unsupportedPayment = async () => {
  throw new Error('Este spike no liquida pagos');
};

const fakeFacilitator: FacilitatorClient = {
  getSupported: async () => testnetSupport,
  verify: unsupportedPayment,
  settle: unsupportedPayment,
};

describe('x402 Stellar compatibility spike', () => {
  it('emits a standard 402 understood by the independent x402 fetch client', async () => {
    const app = express();
    const treasury = 'GAB2NXBPZMJEPZPXMAAEZDJA7SB6ZQRHTT2KF4Z7LMOEAJKSP4JBCWRV';
    app.use(paymentMiddlewareFromConfig({
      'GET /paper': {
        accepts: {
          scheme: 'exact',
          network: 'stellar:testnet',
          payTo: treasury,
          price: '$0.50',
        },
        description: 'PaperPay Testnet paper',
        mimeType: 'application/json',
      },
    }, fakeFacilitator, [
      { network: 'stellar:testnet', server: new ExactStellarScheme() },
    ]));
    app.get('/paper', (_req, res) => res.json({ fullContentMarkdown: 'paid content' }));

    const response = await request(app).get('/paper').set('accept', 'application/json');

    expect(response.status).toBe(402);
    expect(response.body.fullContentMarkdown).toBeUndefined();
    expect(response.headers['payment-required']).toBeDefined();

    const challenge = new x402HTTPClient().getPaymentRequiredResponse((name) =>
      response.headers[name.toLowerCase()],
    );
    expect(challenge.x402Version).toBe(2);
    expect(challenge.accepts).toEqual(expect.arrayContaining([
      expect.objectContaining({
        scheme: 'exact',
        network: 'stellar:testnet',
        amount: '5000000',
        payTo: treasury,
      }),
    ]));
  });
});
