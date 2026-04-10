import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET || 'yiwugo-access-secret-change-me',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'yiwugo-refresh-secret-change-me',
  accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
}));
