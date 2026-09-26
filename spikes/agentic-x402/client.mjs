import 'dotenv/config';
import assert from 'node:assert/strict';
import { open } from 'node:fs/promises';
import { Transaction, TransactionBuilder, rpc } from '@stellar/stellar-sdk';
import { x402Client, x402HTTPClient } from '@x402/fetch';
import { createEd25519Signer, getNetworkPassphrase } from '@x402/stellar';
import { ExactStellarScheme } from '@x402/stellar/exact/client';

const secret = process.env.STELLAR_PRIVATE_KEY;
const payTo = process.env.SPIKE_PAY_TO;
if (!secret || !payTo) {
  throw new Error('STELLAR_PRIVATE_KEY and SPIKE_PAY_TO are required for a paid test');
}

const network = 'stellar:testnet';
const url = process.env.SPIKE_URL ?? 'http://127.0.0.1:4302/paid-paper';
const journalPath = new URL('./.payment-attempt.json', import.meta.url);
const signer = createEd25519Signer(secret, network);
const client = new x402Client().register(
  'stellar:*',
  new ExactStellarScheme(signer, { url: 'https://soroban-testnet.stellar.org' }),
);
const http = new x402HTTPClient(client);
const challenge = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(10_000) });
assert.equal(challenge.status, 402);
const requirement = http.getPaymentRequiredResponse((name) => challenge.headers.get(name));
assert.equal(requirement.x402Version, 2);
assert.equal(requirement.resource.url, url, 'Unexpected resource URL; refusing to sign');
assert.equal(requirement.accepts.length, 1, 'Ambiguous payment options; refusing to sign');
const [terms] = requirement.accepts;
assert.ok(
  terms.scheme === 'exact' &&
  terms.network === network &&
  terms.amount === '100000' &&
  terms.asset === 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA' &&
  terms.payTo === payTo &&
  terms.extra?.areFeesSponsored === true,
  'Unexpected payment terms; refusing to sign',
);

let payment = await client.createPaymentPayload(requirement);
const passphrase = getNetworkPassphrase(network);
const transaction = new Transaction(payment.payload.transaction, passphrase);
const sorobanData = transaction.toEnvelope().v1()?.tx()?.ext()?.sorobanData();
if (sorobanData) {
  payment = {
    ...payment,
    payload: {
      ...payment.payload,
      transaction: TransactionBuilder.cloneFrom(transaction, {
        fee: '1',
        sorobanData,
        networkPassphrase: passphrase,
      }).build().toXDR(),
    },
  };
}

const ledger = await new rpc.Server('https://soroban-testnet.stellar.org').getLatestLedger();
const journal = await open(journalPath, 'wx', 0o600);
try {
  await journal.writeFile(JSON.stringify({
    createdAt: new Date().toISOString(),
    startLedger: ledger.sequence,
    resourceUrl: url,
    payer: signer.address,
    accepted: payment.accepted,
    transaction: payment.payload.transaction,
  }));
  await journal.sync();
} finally {
  await journal.close();
}
console.log('Signed attempt saved locally; do not rerun pay after an uncertain response.');

const paid = await fetch(url, {
  headers: http.encodePaymentSignatureHeader(payment),
  redirect: 'error',
  signal: AbortSignal.timeout(30_000),
});
const receipt = paid.headers.has('payment-response')
  ? http.getPaymentSettleResponse((name) => paid.headers.get(name))
  : null;
console.log(JSON.stringify({ status: paid.status, receipt, body: await paid.json() }, null, 2));
if (!paid.ok) process.exitCode = 1;
