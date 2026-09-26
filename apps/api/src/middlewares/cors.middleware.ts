import cors from 'cors';
import { X402_HEADERS } from '@paperpay/shared';
import { config } from '../config';

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (como curl o Postman) o en desarrollo
    if (!origin || config.nodeEnv === 'development') {
      return callback(null, true);
    }
    if (config.corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    X402_HEADERS.PAYMENT_SIGNATURE,
    'X-Requested-With',
  ],
  exposedHeaders: [
    X402_HEADERS.PAYMENT_REQUIRED,
    X402_HEADERS.PAYMENT_RESPONSE,
  ],
  credentials: true,
});
