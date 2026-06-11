import type { AuthUser } from './user.types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      estateScope?: string | null;
    }
  }
}

export {};
