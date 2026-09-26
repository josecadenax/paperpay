import 'dotenv/config';
import express from 'express';
import { HTTPFacilitatorClient } from '@x402/core/server';
import { paymentMiddlewareFromConfig } from '@x402/express';
import { ExactStellarScheme } from '@x402/stellar/exact/server';

const payTo = process.env.SPIKE_PAY_TO;
if (!payTo || !/^G[A-Z2-7]{55}$/.test(payTo)) {
  throw new Error('SPIKE_PAY_TO must be a Stellar G address');
}

const network = 'stellar:testnet';
const facilitatorUrl = process.env.SPIKE_FACILITATOR_URL ?? 'https://www.x402.org/facilitator';
const port = Number(process.env.PORT ?? 4302);
const app = express();

app.use(paymentMiddlewareFromConfig(
  {
    'GET /paid-paper': {
      accepts: { scheme: 'exact', price: '$0.01', network, payTo },
    },
  },
  new HTTPFacilitatorClient({ url: facilitatorUrl }),
  [{ network, server: new ExactStellarScheme() }],
));

app.get('/paid-paper', (_req, res) => {
  res.json({ paperId: 'spike-only', content: 'x402 interoperability probe' });
});

app.listen(port, () => {
  console.log(`x402 spike listening on http://127.0.0.1:${port}/paid-paper`);
});
