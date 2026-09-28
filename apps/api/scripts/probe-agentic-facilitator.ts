import { HTTPFacilitatorClient } from '@x402/core/server';

// Read-only AP-00 probe. It does not verify, settle, sign or transfer anything.
const facilitatorUrl = process.env.X402_FACILITATOR_URL ?? 'https://www.x402.org/facilitator';
const apiKey = process.env.X402_FACILITATOR_API_KEY;

async function main(): Promise<void> {
  const facilitator = new HTTPFacilitatorClient({
    url: facilitatorUrl,
    timeoutMs: 10_000,
    ...(apiKey ? {
      createAuthHeaders: async () => ({
        supported: { Authorization: `Bearer ${apiKey}` },
      }),
    } : {}),
  });

  const supported = await facilitator.getSupported();
  const stellarExact = supported.kinds.filter((kind) =>
    kind.x402Version === 2 && kind.scheme === 'exact' && kind.network === 'stellar:testnet',
  );
  if (stellarExact.length === 0) {
    throw new Error('El facilitador no anuncia x402 v2 exact para stellar:testnet.');
  }

  console.log(JSON.stringify({
    url: facilitatorUrl,
    network: 'stellar:testnet',
    supportedKinds: stellarExact,
  }, null, 2));
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Error de consulta del facilitador';
  console.error(`No se pudo confirmar soporte de Stellar: ${message}`);
  process.exitCode = 1;
});
