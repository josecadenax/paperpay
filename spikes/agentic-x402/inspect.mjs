import assert from 'node:assert/strict';
import { x402Client, x402HTTPClient } from '@x402/fetch';

const url = process.env.SPIKE_URL ?? 'http://127.0.0.1:4302/paid-paper';
const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
assert.equal(response.status, 402, `Expected 402, received ${response.status}`);

const requirement = new x402HTTPClient(new x402Client())
  .getPaymentRequiredResponse((name) => response.headers.get(name));
assert.equal(requirement.x402Version, 2);
assert.ok(requirement.accepts.some((item) =>
  item.scheme === 'exact' && item.network === 'stellar:testnet' && item.amount === '100000',
));

console.log(JSON.stringify({
  status: response.status,
  paymentRequiredHeader: response.headers.get('payment-required'),
  x402Version: requirement.x402Version,
  resource: requirement.resource,
  accepts: requirement.accepts,
}, null, 2));
