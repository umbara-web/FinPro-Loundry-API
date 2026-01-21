import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

import { createCustomError } from '../utils/customError';
import { SECRET_KEY } from '../../configs/env.config';

export interface Token {
  userId: string;
  email: string;
  role: string;
  isVerified: boolean;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: Token;
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    let token = '';

    if (req.cookies && req.cookies['auth_token']) {
      token = req.cookies['auth_token'];
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      throw createCustomError(401, 'Unauthorized');
    }

    const decoded = verify(token, SECRET_KEY) as Token;

    req.user = decoded;

    next();
  } catch (err) {
    next(err);
  }
}

export function roleGuard(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) throw createCustomError(401, 'invalid token');

      if (!allowedRoles.includes(user?.role))
        throw createCustomError(403, 'Insufficient permissions');

      next();
    } catch (err) {
      next(err);
    }
  };
}

export function verificationGuard(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user;

    if (!user) throw createCustomError(401, 'Unauthorized');

    if (!user.isVerified) {
      throw createCustomError(
        403,
        'Akun belum terverifikasi. Silakan verifikasi email Anda.'
      );
    }

    next();
  } catch (err) {
    next(err);
  }
}
