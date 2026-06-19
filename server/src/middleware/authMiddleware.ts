import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'mana-nivas-secret-key-123';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'user' | 'admin';
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    res.status(401).json({ error: 'Access token required.' });
    return;
  }

  try {
    // Verify local JWT
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };

    if (!decoded || !decoded.id) {
      res.status(403).json({ error: 'Invalid or expired token.' });
      return;
    }

    // Fetch user details from Neon Postgres public.profiles
    const result = await pool.query(
      'SELECT id, role FROM public.profiles WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      res.status(403).json({ error: 'User profile not found.' });
      return;
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: result.rows[0].role as 'user' | 'admin',
    };

    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    return;
  }
  next();
};
