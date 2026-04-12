import rateLimit from 'express-rate-limit';
import { config } from '../config/env';

// General API rate limiter: 100 req/15min per IP
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// AI generation limiter: 20 req/hour per user
export const aiGenerationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'AI generation limit reached. You can generate up to 20 images per hour.',
  },
  keyGenerator: (req) => {
    // Rate-limit per user if authenticated, otherwise per IP
    return req.user?.userId || req.ip || 'unknown';
  },
});

// Auth rate limiter: 10 req/15min per IP (brute-force protection)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many authentication attempts.' },
});
