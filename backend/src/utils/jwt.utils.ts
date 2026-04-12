import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
}

export const signToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, config.jwt.secret) as JWTPayload;
};
