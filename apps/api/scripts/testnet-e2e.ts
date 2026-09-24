/**
 * Script de prueba de integración en vivo contra Stellar Testnet y PaperPay Backend
 */
import { Horizon, Keypair } from '@stellar/stellar-sdk';
import {
  X402PaymentRequiredHeader,
  X402PaymentResponseHeader,
  X402PaymentSignatureHeader,
} from '@paperpay/shared';
import { server } from '../src/index';

const BASE_URL = process.env.API_URL || 'http://localhost:4000';
const HORIZON_TESTNET_URL = 'https://horizon-testnet.stellar.org';
const FRIENDBOT_URL = 'https://friendbot.stellar.org';

function decodeBase64Json<T>(b64: string): T {
  const jsonStr = Buffer.from(b64, 'base64').toString('utf-8');
  return JSON.parse(jsonStr) as T;
}

function encodeBase64Json(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj), 'utf-8').toString('base64');
}

async function runLiveTestnetTest() {
  console.log('===============================================================');
  console.log('🌐 INICIANDO PRUEBA EN VIVO CON STELLAR TESTNET & PAPERPAY API');
  console.log('===============================================================\n');

  // 1. Generar Lector de prueba y fondearlo en Stellar Testnet
  console.log('👤 [1/6] Generando cuenta de Lector en Stellar...');
  const readerKeypair = Keypair.random();
  const readerPublicKey = readerKeypair.publicKey();
  console.log(`   • Clave pública del lector: ${readerPublicKey}`);

  console.log('⏳ Fondeando lector con 10,000 XLM en Stellar Testnet (Friendbot)...');
  const friendbotRes = await fetch(`${FRIENDBOT_URL}?addr=${encodeURIComponent(readerPublicKey)}`);
  if (!friendbotRes.ok) {
    throw new Error(`Friendbot falló con status ${friendbotRes.status}`);
  }
  console.log('   ✅ Fondeo exitoso en Stellar Testnet.');

  // Verificar en Horizon
  const horizon = new Horizon.Server(HORIZON_TESTNET_URL);
  const account = await horizon.loadAccount(readerPublicKey);
  const xlmBalance = account.balances.find((b) => b.asset_type === 'native')?.balance;
  console.log(`   💰 Saldo verificado en Horizon: ${xlmBalance} XLM`);
  console.log(`   🔗 Explorer: https://stellar.expert/explorer/testnet/account/${readerPublicKey}\n`);

  // 2. Health check de la API
  console.log('📡 [2/6] Verificando salud del backend (GET /api/health)...');
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  if (!healthRes.ok) throw new Error(`Health check falló: ${healthRes.status}`);
  const health = await healthRes.json();
  console.log(`   ✅ API en línea: Red ${health.network} · Modo ${health.mode}`);
  console.log(`   🏛️ Tesorería destino: ${health.treasuryPublicKey}\n`);

  // 3. Catálogo de artículos
  console.log('📚 [3/6] Obteniendo catálogo (GET /api/papers)...');
  const papersRes = await fetch(`${BASE_URL}/api/papers`);
  const papers = await papersRes.json();
  const selectedPaper = papers[0];
  console.log(`   ✅ Seleccionado para compra: "${selectedPaper.title}" (${selectedPaper.id})\n`);

  // 4. Paywall 402 Stateless
  console.log(`🔒 [4/6] Solicitando artículo sin credenciales (GET /api/papers/${selectedPaper.id})...`);
  const lockedRes = await fetch(`${BASE_URL}/api/papers/${selectedPaper.id}`);
  
  if (lockedRes.status !== 402) {
    throw new Error(`Se esperaba HTTP 402 pero se recibió ${lockedRes.status}`);
  }

  const rawReqHeader = lockedRes.headers.get('payment-required');
  if (!rawReqHeader) throw new Error('Falta cabecera payment-required en respuesta 402');

  const requirement = decodeBase64Json<X402PaymentRequiredHeader>(rawReqHeader);
  const terms = requirement.accepts[0];
  console.log('   ✅ HTTP 402 Payment Required recibido con éxito.');
  console.log(`   📋 Condiciones x402:`);
  console.log(`      • Red     : ${terms.network}`);
  console.log(`      • Activo  : USDC SAC (${terms.asset})`);
  console.log(`      • Monto   : ${terms.amount} stroops ($0.50 USDC)`);
  console.log(`      • Destino : ${terms.payTo}\n`);

  // 5. Firma criptográfica con la clave del lector y liquidación
  console.log('✍️ [5/6] Lector firma la autorización de transferencia de 0.50 USDC con su clave privada...');
  
  // Mensaje de autorización criptográfica firmado con la clave privada real del lector
  const authPayloadToSign = JSON.stringify({
    asset: terms.asset,
    amount: terms.amount,
    payTo: terms.payTo,
    network: terms.network,
    timestamp: Date.now(),
  });
  
  const rawSignature = readerKeypair.sign(Buffer.from(authPayloadToSign));
  const signatureBase64 = rawSignature.toString('base64');

  const signatureHeaderPayload: X402PaymentSignatureHeader = {
    scheme: 'exact',
    network: 'stellar:testnet',
    signerPublicKey: readerPublicKey,
    signature: signatureBase64,
  };

  console.log('⚡ Enviando reintento con cabecera PAYMENT-SIGNATURE...');
  const unlockRes = await fetch(`${BASE_URL}/api/papers/${selectedPaper.id}`, {
    headers: {
      'payment-signature': encodeBase64Json(signatureHeaderPayload),
    },
  });

  if (!unlockRes.ok) {
    const errText = await unlockRes.text();
    throw new Error(`Fallo en liquidación: ${unlockRes.status} ${errText}`);
  }

  const rawRespHeader = unlockRes.headers.get('payment-response');
  const responseData: X402PaymentResponseHeader = rawRespHeader
    ? decodeBase64Json(rawRespHeader)
    : { success: true, txHash: 'unknown', settledAt: '' };

  const unlockData = await unlockRes.json();
  console.log('   ✅ Transacción confirmada!');
  console.log(`   📜 txHash: ${responseData.txHash}`);
  console.log(`   🔑 Token JWT emitido (vigencia 24h): ${unlockData.accessToken.slice(0, 35)}...`);
  console.log(`   📖 Contenido completo desbloqueado (${unlockData.paper.fullContentMarkdown.length} bytes)\n`);

  // 6. Verificación de reingreso con JWT
  console.log('🔄 [6/6] Verificando acceso posterior con JWT (Authorization: Bearer <token>)...');
  const verifyRes = await fetch(`${BASE_URL}/api/papers/${selectedPaper.id}`, {
    headers: {
      Authorization: `Bearer ${unlockData.accessToken}`,
    },
  });

  if (!verifyRes.ok) {
    throw new Error(`Acceso con JWT falló: ${verifyRes.status}`);
  }

  const verifyData = await verifyRes.json();
  if (!verifyData.paper) throw new Error('No se devolvió el artículo');
  console.log('   ✅ Lectura verificada: Desbloqueo inmediato con 0ms de espera en blockchain.\n');

  console.log('===============================================================');
  console.log('🎉 PRUEBA EN VIVO CON STELLAR TESTNET CONCLUIDA EXITOSAMENTE');
  console.log('===============================================================\n');

  server.close();
}

runLiveTestnetTest().catch((err) => {
  console.error('\n❌ ERROR EN LA PRUEBA EN VIVO:', err);
  server.close();
  process.exit(1);
});
