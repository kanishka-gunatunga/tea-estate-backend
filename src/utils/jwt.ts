import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import type { AuthUser } from '../types/user.types';

interface TokenPayload {
  userId: string;
  email: string;
  role: AuthUser['role'];
}

export function signToken(user: AuthUser): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyToken(token: string): AuthUser {
  const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;

  return {
    id: payload.userId,
    email: payload.email,
    role: payload.role,
  };
}
