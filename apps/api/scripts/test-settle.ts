/**
 * Script de prueba de integración de endpoints x402 de PaperPay
 */
import { X402PaymentRequiredHeader, X402PaymentSignatureHeader } from '@paperpay/shared';
import { server } from '../src/index';

const BASE_URL = process.env.API_URL || 'http://localhost:4000';

function decodeBase64Json<T>(b64: string): T {
  const jsonStr = Buffer.from(b64, 'base64').toString('utf-8');
  return JSON.parse(jsonStr) as T;
}

function encodeBase64Json(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj), 'utf-8').toString('base64');
}

async function runTests() {
  console.log(`\n🧪 Iniciando pruebas contra ${BASE_URL}...\n`);

  // 1. Health check
  console.log('1️⃣ Probando GET /api/health...');
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  if (!healthRes.ok) throw new Error(`Health falló con status ${healthRes.status}`);
  const health = await healthRes.json();
  console.log('   ✅ Health OK:', health);

  // 2. Catálogo de artículos
  console.log('\n2️⃣ Probando GET /api/papers...');
  const papersRes = await fetch(`${BASE_URL}/api/papers`);
  if (!papersRes.ok) throw new Error(`Papers falló con status ${papersRes.status}`);
  const papers = await papersRes.json();
  console.log(`   ✅ Catálogo cargado: ${papers.length} artículos encontrados.`);
  console.log(`   Primer artículo: "${papers[0].title}" (${papers[0].id})`);

  // 3. Petición sin credenciales a artículo protegido (espera 402)
  const targetPaperId = papers[0].id;
  console.log(`\n3️⃣ Probando GET /api/papers/${targetPaperId} (sin credenciales, esperando 402)...`);
  const lockedRes = await fetch(`${BASE_URL}/api/papers/${targetPaperId}`);
  
  if (lockedRes.status !== 402) {
    throw new Error(`Se esperaba status 402 pero se recibió ${lockedRes.status}`);
  }
  console.log('   ✅ Respuesta HTTP 402 Payment Required recibida correctamente.');

  const paymentRequiredHeader = lockedRes.headers.get('payment-required');
  if (!paymentRequiredHeader) {
    throw new Error('Falta la cabecera payment-required en la respuesta 402');
  }

  const requirement = decodeBase64Json<X402PaymentRequiredHeader>(paymentRequiredHeader);
  console.log('   ✅ Cabecera payment-required decodificada con éxito:');
  console.log('      • Red:', requirement.accepts[0].network);
  console.log('      • Activo:', requirement.accepts[0].asset);
  console.log('      • Monto:', requirement.accepts[0].amount, 'stroops (0.50 USDC)');
  console.log('      • Tesorería:', requirement.accepts[0].payTo);

  const lockedBody = await lockedRes.json();
  if (lockedBody.paper || lockedBody.fullContentMarkdown) {
    throw new Error('FALLO DE SEGURIDAD: El texto completo se filtró en la respuesta 402!');
  }
  console.log('   ✅ Paywall stateless verificado: solo se entregó el preview, el contenido completo está protegido.');

  // 4. Petición con PAYMENT-SIGNATURE simulando firma de Freighter
  console.log('\n4️⃣ Probando reintento con cabecera PAYMENT-SIGNATURE...');
  const signaturePayload: X402PaymentSignatureHeader = {
    scheme: 'exact',
    network: 'stellar:testnet',
    signerPublicKey: 'GDEMOLECTORUNAMTESTNETWALLET1234567890ABCDEF',
    signature: 'mock_soroban_authorization_entry_xdr_base64_demo',
  };

  const unlockRes = await fetch(`${BASE_URL}/api/papers/${targetPaperId}`, {
    headers: {
      'payment-signature': encodeBase64Json(signaturePayload),
    },
  });

  if (!unlockRes.ok) {
    const errorBody = await unlockRes.text();
    throw new Error(`Liquidación falló con status ${unlockRes.status}: ${errorBody}`);
  }

  const paymentResponseHeader = unlockRes.headers.get('payment-response');
  console.log('   ✅ Cabecera payment-response recibida:', paymentResponseHeader ? decodeBase64Json(paymentResponseHeader) : 'N/A');

  const unlockedBody = await unlockRes.json();
  if (!unlockedBody.paper || !unlockedBody.paper.fullContentMarkdown || !unlockedBody.accessToken) {
    throw new Error('La respuesta 200 no incluyó el artículo completo o el accessToken');
  }
  console.log('   ✅ Artículo desbloqueado con éxito!');
  console.log('      • txHash:', unlockedBody.txHash);
  console.log('      • Token JWT recibido (longitud):', unlockedBody.accessToken.length);
  console.log('      • Extracto de contenido:', unlockedBody.paper.fullContentMarkdown.slice(0, 120), '...');

  // 5. Verificación de acceso persistente usando el JWT generado
  console.log('\n5️⃣ Probando acceso subsecuente usando Authorization: Bearer <jwt>...');
  const jwtRes = await fetch(`${BASE_URL}/api/papers/${targetPaperId}`, {
    headers: {
      Authorization: `Bearer ${unlockedBody.accessToken}`,
    },
  });

  if (!jwtRes.ok) {
    throw new Error(`Acceso con JWT falló con status ${jwtRes.status}`);
  }

  const jwtBody = await jwtRes.json();
  if (!jwtBody.paper) {
    throw new Error('Acceso con JWT no devolvió el artículo');
  }
  console.log('   ✅ Sesión verificada: El JWT permite leer el artículo sin volver a pagar.');

  console.log('\n✅ Flujo HTTP de demo completado. No se transfirió USDC.\n');
  server.close();
}

runTests().catch((err) => {
  console.error('\n❌ ERROR EN LA PRUEBA:', err);
  server.close();
  process.exit(1);
});
