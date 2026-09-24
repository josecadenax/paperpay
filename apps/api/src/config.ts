import dotenv from 'dotenv';
import path from 'path';

// Cargar .env si existe
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface AppConfig {
  port: number;
  nodeEnv: string;
  stellarTreasuryPublicKey: string;
  selfSettle: boolean;
  stellarBackupSecretKey?: string;
  openZeppelinChannelsUrl: string;
  openZeppelinApiKey: string;
  jwtSecret: string;
  corsOrigins: string[];
}

const defaultTreasuryKey = 'GB6X402TREASURYDEMOUNAM2026GOYAHACKPAPERPAYTESTNET';

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  stellarTreasuryPublicKey: process.env.STELLAR_TREASURY_PUBLIC_KEY || defaultTreasuryKey,
  selfSettle: process.env.SELF_SETTLE === 'true',
  stellarBackupSecretKey: process.env.STELLAR_BACKUP_SECRET_KEY,
  openZeppelinChannelsUrl: process.env.OPENZEPPELIN_CHANNELS_URL || 'https://channels.openzeppelin.com/x402/testnet',
  openZeppelinApiKey: process.env.OPENZEPPELIN_API_KEY || 'demo_key',
  jwtSecret: process.env.JWT_SECRET || 'paperpay_hackathon_goya_2026_default_secret_key',
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim())
    : ['http://localhost:3000', 'http://localhost:4000', 'https://paperpay.vercel.app'],
};
