import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI as string,
  jwt: {
    secret: process.env.JWT_SECRET as string,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  aiRateLimit: parseInt(process.env.AI_RATE_LIMIT || '5', 10),
} as const;
