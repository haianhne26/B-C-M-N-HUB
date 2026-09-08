import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'bacmonhub_default_jwt_secret_change_in_prod',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'bacmonhub_default_refresh_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  mt5BridgeToken: process.env.MT5_BRIDGE_TOKEN || 'bmh_mt5_secure_bridge_token_2026',
  appDownloadBaseUrl: process.env.APP_DOWNLOAD_BASE_URL || 'http://localhost:4000/updates',
};
