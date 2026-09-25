/** Smoke test de Testnet y del paywall. No realiza ni confirma un pago. */
import { Horizon, Keypair } from '@stellar/stellar-sdk';
import type { X402PaymentRequiredHeader } from '@paperpay/shared';
import { server } from '../src/index';

const baseUrl = process.env.API_URL || 'http://localhost:4000';

async function run() {
  const account = Keypair.random().publicKey();
  const friendbot = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(account)}`);
  if (!friendbot.ok) throw new Error(`Friendbot respondió ${friendbot.status}`);
  await new Horizon.Server('https://horizon-testnet.stellar.org').loadAccount(account);

  const health = await fetch(`${baseUrl}/api/health`);
  if (!health.ok) throw new Error(`Health respondió ${health.status}`);
  const catalog = await fetch(`${baseUrl}/api/papers`);
  if (!catalog.ok) throw new Error(`Catálogo respondió ${catalog.status}`);
  const papers = await catalog.json() as Array<{ id: string }>;
  if (!papers[0]) throw new Error('Catálogo vacío');

  const path = `${baseUrl}/api/papers/${encodeURIComponent(papers[0].id)}`;
  const locked = await fetch(path);
  if (locked.status !== 402) throw new Error(`Se esperaba 402, llegó ${locked.status}`);
  const header = locked.headers.get('payment-required');
  if (!header) throw new Error('Falta payment-required');
  const terms = JSON.parse(Buffer.from(header, 'base64').toString()) as X402PaymentRequiredHeader;
  if (terms.accepts[0]?.network !== 'stellar:testnet') throw new Error('Red de pago incorrecta');
  const body = await locked.json() as Record<string, unknown>;
  if (body.paper || !body.preview) throw new Error('El paywall expuso contenido o no entregó preview');

  console.log('Testnet, API y paywall 402 verificados. No se ejecutó ningún pago.');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => server.close());
