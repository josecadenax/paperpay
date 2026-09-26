import 'dotenv/config';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  Address,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  scValToNative,
} from '@stellar/stellar-sdk';
import { getNetworkPassphrase } from '@x402/stellar';

const usdcContract = 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA';
const rpcServer = new rpc.Server('https://soroban-testnet.stellar.org');
const journalPath = process.env.SPIKE_RECONCILE_JOURNAL
  ?? new URL('./.payment-attempt.json', import.meta.url);
const journal = JSON.parse(await readFile(journalPath, 'utf8'));
const { accepted, payer, startLedger } = journal;
assert.equal(accepted.network, 'stellar:testnet');
assert.equal(accepted.scheme, 'exact');
assert.equal(accepted.asset, usdcContract);
assert.equal(accepted.payTo, process.env.SPIKE_PAY_TO);
assert.equal(accepted.amount, '100000');
assert.ok(Number.isSafeInteger(startLedger) && startLedger > 0);

function authEntries(txXdr) {
  const envelope = TransactionBuilder.fromXDR(
    txXdr,
    getNetworkPassphrase('stellar:testnet'),
  );
  const transaction = envelope.innerTransaction ?? envelope;
  assert.equal(transaction.operations.length, 1);
  const [operation] = transaction.operations;
  assert.equal(operation.type, 'invokeHostFunction');
  return operation.auth ?? [];
}

const expectedAuth = authEntries(journal.transaction)
  .filter((entry) => {
    const credentials = entry.credentials();
    return credentials.switch().name === 'sorobanCredentialsAddress'
      && Address.fromScAddress(credentials.address().address()).toString() === payer;
  })
  .map((entry) => entry.toXDR('base64'));
assert.equal(expectedAuth.length, 1, 'Expected one signed payer authorization');

const health = await rpcServer.getHealth();
if (startLedger < health.oldestLedger) {
  console.log(JSON.stringify({ status: 'inconclusive', reason: 'RPC history expired' }));
  process.exit(2);
}

const addressTopic = (address) => nativeToScVal(address, { type: 'address' }).toXDR('base64');
const transferTopic = nativeToScVal('transfer', { type: 'symbol' }).toXDR('base64');
const filters = [{
  type: 'contract',
  contractIds: [usdcContract],
  topics: [[transferTopic, addressTopic(payer), addressTopic(accepted.payTo), '**']],
}];

let pages = 0;
let complete = true;
const matched = new Set();
for (let start = startLedger; start <= health.latestLedger && complete; start += 1000) {
  const end = Math.min(start + 1000, health.latestLedger + 1);
  let cursor;
  do {
    const page = await rpcServer.getEvents(cursor
      ? { filters, cursor, limit: 200 }
      : { filters, startLedger: start, endLedger: end, limit: 200 });
    pages += 1;
    for (const event of page.events) {
      if (event.ledger >= end) break;
      if (!event.inSuccessfulContractCall || event.topic.length < 3) continue;
      const [kind, from, to] = event.topic.map(scValToNative);
      if (kind !== 'transfer' || from !== payer || to !== accepted.payTo) continue;
      if (scValToNative(event.value) !== BigInt(accepted.amount)) continue;

      const settled = await rpcServer.getTransaction(event.txHash);
      if (settled.status !== 'SUCCESS') continue;
      const actualAuth = authEntries(settled.envelopeXdr.toXDR('base64'))
        .map((entry) => entry.toXDR('base64'));
      if (actualAuth.includes(expectedAuth[0])) matched.add(event.txHash);
    }
    if (page.events.length < 200 || page.events.at(-1)?.ledger >= end) break;
    cursor = page.cursor;
    if (pages >= 1000) {
      complete = false;
      break;
    }
  } while (cursor);
}

console.log(JSON.stringify({
  status: !complete ? 'inconclusive' : matched.size === 1 ? 'matched' : matched.size > 1 ? 'ambiguous' : 'pending',
  transactionHashes: [...matched],
  scannedThroughLedger: health.latestLedger,
  pages,
}, null, 2));
if (!complete || matched.size !== 1) process.exitCode = 2;
