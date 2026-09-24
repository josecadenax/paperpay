import { Horizon, Keypair } from '@stellar/stellar-sdk';
import fs from 'fs';
import path from 'path';

const HORIZON_TESTNET_URL = 'https://horizon-testnet.stellar.org';
const FRIENDBOT_URL = 'https://friendbot.stellar.org';

async function generateTreasury() {
  console.log('🏛️ Generando nueva cuenta de Tesorería para PaperPay en Stellar Testnet...\n');

  const keypair = Keypair.random();
  const publicKey = keypair.publicKey();
  const secretKey = keypair.secret();

  console.log(`Clave pública (payTo) : ${publicKey}`);
  console.log(`Clave secreta         : ${secretKey}\n`);

  console.log('⏳ Fondeando cuenta con Friendbot (10,000 XLM de prueba)...');
  const friendbotRes = await fetch(`${FRIENDBOT_URL}?addr=${encodeURIComponent(publicKey)}`);
  
  if (!friendbotRes.ok) {
    throw new Error(`Friendbot falló con status ${friendbotRes.status}`);
  }

  console.log('✅ Cuenta fondeada exitosamente en el ledger de Stellar Testnet.');

  // Verificar balance en Horizon
  const server = new Horizon.Server(HORIZON_TESTNET_URL);
  const account = await server.loadAccount(publicKey);
  const nativeBalance = account.balances.find((b) => b.asset_type === 'native');
  console.log(`💰 Saldo confirmado en Horizon: ${nativeBalance?.balance} XLM`);

  console.log(`\n🔍 Ver en explorador: https://stellar.expert/explorer/testnet/account/${publicKey}\n`);

  // Guardar en .env local si no existe
  const envPath = path.resolve(__dirname, '../.env');
  const envContent = `# Configuración generada automáticamente para Stellar Testnet
PORT=4000
NODE_ENV=development
STELLAR_NETWORK=testnet
STELLAR_TREASURY_PUBLIC_KEY=${publicKey}
STELLAR_BACKUP_SECRET_KEY=${secretKey}
SELF_SETTLE=false
OPENZEPPELIN_CHANNELS_URL=https://channels.openzeppelin.com/x402/testnet
OPENZEPPELIN_API_KEY=oz_test_paperpay_demo
JWT_SECRET=paperpay_jwt_secret_goya_hack_2026_${Date.now()}
CORS_ORIGINS=http://localhost:3000,http://localhost:4000,https://paperpay.vercel.app
`;

  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envContent, 'utf-8');
    console.log(`💾 Archivo .env creado en apps/api/.env con las credenciales de tesorería.`);
  } else {
    console.log(`ℹ️ El archivo apps/api/.env ya existe. Si deseas actualizarlo, reemplaza STELLAR_TREASURY_PUBLIC_KEY=${publicKey}`);
  }
}

generateTreasury().catch((err) => {
  console.error('❌ Error al generar tesorería:', err);
  process.exit(1);
});
