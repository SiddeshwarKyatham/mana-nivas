import express, { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'mana-nivas-secret-key-123';

// 1. POST /api/auth/register (User signup)
router.post('/register', async (req, res: Response) => {
  const { name, phone, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email, and password are required.' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    // Check if email already exists
    const checkEmail = await pool.query('SELECT id FROM public.profiles WHERE email = $1', [normalizedEmail]);
    if (checkEmail.rows.length > 0) {
      res.status(400).json({ error: 'An account with this email address already exists.' });
      return;
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Generate UUID
    const userId = crypto.randomUUID();

    // Set first user or specific email as admin
    const isAdmin = normalizedEmail === 'admin12@gmail.com';
    const role = isAdmin ? 'admin' : 'user';

    // Insert profile
    const insertQuery = `
      INSERT INTO public.profiles (id, full_name, phone, email, password_hash, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, full_name, phone, email, role, created_at
    `;
    const result = await pool.query(insertQuery, [userId, name, phone || '', normalizedEmail, passwordHash, role]);

    res.status(201).json({ message: 'User registered successfully.', user: result.rows[0] });
  } catch (err: any) {
    console.error('Error during registration:', err);
    res.status(500).json({ error: err.message || 'Registration failed.' });
  }
});

// 2. POST /api/auth/login (User login)
router.post('/login', async (req, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    // Find user by email
    const result = await pool.query('SELECT * FROM public.profiles WHERE email = $1', [normalizedEmail]);
    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const user = result.rows[0];

    if (!user.password_hash) {
      res.status(401).json({ error: 'Authentication method not supported. Please sign up.' });
      return;
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' } // Token expires in 7 days
    );

    // Map fields to match what frontend context expects
    const userPayload = {
      _id: user.id,
      name: user.full_name || 'User',
      email: user.email,
      role: user.role || 'user',
    };

    res.json({
      message: 'Login successful.',
      token,
      user: userPayload,
    });
  } catch (err: any) {
    console.error('Error during login:', err);
    res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

// 3. GET /api/auth/me (Check active user session)
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  try {
    const result = await pool.query(
      'SELECT id, full_name, phone, email, role, created_at FROM public.profiles WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User profile not found.' });
      return;
    }

    const user = result.rows[0];
    const userPayload = {
      _id: user.id,
      name: user.full_name || 'User',
      email: user.email,
      role: user.role || 'user',
    };

    res.json({ user: userPayload });
  } catch (err: any) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
