import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { SECRET_KEY } from '../../configs/env.config';

// Removed: const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export interface AuthPayload {
  id: string;
  role: string;
  email?: string;
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') {
    return next();
  }

  const authHeader = req.headers.authorization || '';
  let token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  if (!token && req.cookies && req.cookies['auth_token']) {
    token = req.cookies['auth_token'];
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: token missing' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as AuthPayload;
    console.log('Admin Auth Middleware - Decoded User:', JSON.stringify(decoded, null, 2)); // Debug log
    (req as any).user = decoded;
    next();
  } catch (err) {
    console.error('Admin Auth Middleware - JWT verification failed:', err);
    console.error('Token used:', token.substring(0, 10) + '...'); // Log partial token safely
    return res.status(401).json({ error: 'Unauthorized: invalid token' });
  }
};

export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as AuthPayload | undefined;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    if (user.role !== role) return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    next();
  };
};

export const requireSuperAdmin = requireRole('SUPER_ADMIN');
