import app from './app';
import { config, isUnsafeJwtSecret } from './config';
import { StrKey } from '@stellar/stellar-sdk';

if (config.nodeEnv === 'production') {
  // Se valida la variable de entorno, no config.jwtSecret: el valor por defecto es público.
  if (isUnsafeJwtSecret(process.env.JWT_SECRET)) {
    throw new Error('Producción requiere JWT_SECRET aleatorio de al menos 32 caracteres; no se aceptan el valor por defecto ni los de ejemplo del repositorio.');
  }
  if (!StrKey.isValidEd25519PublicKey(config.stellarTreasuryPublicKey) ||
      (!config.selfSettle && !process.env.OPENZEPPELIN_API_KEY)) {
    throw new Error('Producción requiere tesorería Stellar válida y API key del facilitador si aplica.');
  }
}

const port = config.port;
export const server = app.listen(port, () => {
  console.log(`PaperPay API escuchando en el puerto ${port}; modo ${config.selfSettle ? 'SELF_SETTLE' : 'FACILITATOR'}.`);
});
