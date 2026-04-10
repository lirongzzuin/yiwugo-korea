import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiUrl: process.env.API_URL || 'http://localhost:4000',
  siteUrl: process.env.SITE_URL || 'http://localhost:3000',
  siteName: process.env.SITE_NAME || 'YiwuGo Korea',
  corsOrigins: process.env.CORS_ORIGINS || 'http://localhost:3000',
  encryptionSecret: process.env.ENCRYPTION_SECRET || 'yiwugo-encryption-secret-change-me',
}));
