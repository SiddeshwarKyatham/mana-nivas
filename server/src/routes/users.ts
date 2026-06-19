import express, { Response } from 'express';
import pool from '../db';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = express.Router();

// 1. GET all user profiles (admin only)
router.get('/', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, full_name, phone, role, created_at FROM public.profiles ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching user profiles:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch profiles' });
  }
});

// 2. GET current user's profile
router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }
  
  try {
    const result = await pool.query(
      'SELECT id, full_name, phone, role, created_at FROM public.profiles WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      // Fallback: create default profile if it's missing in Neon
      const createRes = await pool.query(
        `INSERT INTO public.profiles (id, full_name, phone, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, full_name, phone, role, created_at`,
        [req.user.id, 'Guest User', '', 'user']
      );
      res.json(createRes.rows[0]);
      return;
    }

    res.json(result.rows[0]);
  } catch (err: any) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch profile' });
  }
});

// 3. GET user profile by ID (either owner or admin)
router.get('/profile/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  if (req.user.role !== 'admin' && req.user.id !== id) {
    res.status(403).json({ error: 'Access denied.' });
    return;
  }

  try {
    const result = await pool.query(
      'SELECT id, full_name, phone, role, created_at FROM public.profiles WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Profile not found.' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err: any) {
    console.error('Error fetching profile by ID:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch profile' });
  }
});

// 4. PUT update user profile (owner or admin)
router.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { full_name, phone } = req.body;
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  try {
    const result = await pool.query(
      `UPDATE public.profiles
       SET full_name = COALESCE($1, full_name),
           phone = COALESCE($2, phone)
       WHERE id = $3
       RETURNING id, full_name, phone, role, created_at`,
      [full_name, phone, req.user.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Profile not found.' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err: any) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: err.message || 'Failed to update profile' });
  }
});

export default router;
