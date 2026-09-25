import { Horizon, Keypair, Asset, TransactionBuilder, Networks, Operation } from '@stellar/stellar-sdk';
import { config } from '../src/config';

// Issuer estándar de USDC en Testnet (Circle)
const USDC_ISSUER = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
const USDC_ASSET = new Asset('USDC', USDC_ISSUER);
const HORIZON_URL = 'https://horizon-testnet.stellar.org';

async function setupTrustline() {
  const secret = config.stellarBackupSecretKey;
  if (!secret) {
    throw new Error('No STELLAR_BACKUP_SECRET_KEY in env');
  }

  const keypair = Keypair.fromSecret(secret);
  const server = new Horizon.Server(HORIZON_URL);
  
  console.log(`Configuring Trustline for treasury: ${keypair.publicKey()}`);
  
  const account = await server.loadAccount(keypair.publicKey());
  
  const hasTrustline = account.balances.some(
    (b) => 'asset_code' in b && b.asset_code === 'USDC' && b.asset_issuer === USDC_ISSUER
  );

  if (hasTrustline) {
    console.log('✅ Treasury already has a USDC trustline.');
    return;
  }

  console.log('⏳ Submitting ChangeTrust transaction...');
  const tx = new TransactionBuilder(account, {
    fee: '1000',
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.changeTrust({
        asset: USDC_ASSET,
      })
    )
    .setTimeout(30)
    .build();

  tx.sign(keypair);

  const res = await server.submitTransaction(tx);
  console.log('✅ Trustline established! Tx:', res.hash);
}

setupTrustline().catch(console.error);
