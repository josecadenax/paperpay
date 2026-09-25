import app from './app';
import { config } from './config';
import { StrKey } from '@stellar/stellar-sdk';

if (config.nodeEnv === 'production' &&
    (config.jwtSecret.length < 32 || !StrKey.isValidEd25519PublicKey(config.stellarTreasuryPublicKey) ||
     (!config.selfSettle && !process.env.OPENZEPPELIN_API_KEY))) {
  throw new Error('Producción requiere JWT_SECRET seguro, tesorería Stellar válida y API key del facilitador si aplica.');
}

const port = config.port;
export const server = app.listen(port, () => {
  console.log(`PaperPay API escuchando en el puerto ${port}; modo ${config.selfSettle ? 'SELF_SETTLE' : 'FACILITATOR'}.`);
});
