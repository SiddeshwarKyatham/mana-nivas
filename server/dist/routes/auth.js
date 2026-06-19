"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const db_1 = __importDefault(require("../db"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'mana-nivas-secret-key-123';
// 1. POST /api/auth/register (User signup)
router.post('/register', async (req, res) => {
    const { name, phone, email, password } = req.body;
    if (!name || !email || !password) {
        res.status(400).json({ error: 'Name, email, and password are required.' });
        return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    try {
        // Check if email already exists
        const checkEmail = await db_1.default.query('SELECT id FROM public.profiles WHERE email = $1', [normalizedEmail]);
        if (checkEmail.rows.length > 0) {
            res.status(400).json({ error: 'An account with this email address already exists.' });
            return;
        }
        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcryptjs_1.default.hash(password, saltRounds);
        // Generate UUID
        const userId = crypto_1.default.randomUUID();
        // Set first user or specific email as admin
        const isAdmin = normalizedEmail === 'admin12@gmail.com';
        const role = isAdmin ? 'admin' : 'user';
        // Insert profile
        const insertQuery = `
      INSERT INTO public.profiles (id, full_name, phone, email, password_hash, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, full_name, phone, email, role, created_at
    `;
        const result = await db_1.default.query(insertQuery, [userId, name, phone || '', normalizedEmail, passwordHash, role]);
        res.status(201).json({ message: 'User registered successfully.', user: result.rows[0] });
    }
    catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ error: err.message || 'Registration failed.' });
    }
});
// 2. POST /api/auth/login (User login)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required.' });
        return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    try {
        // Find user by email
        const result = await db_1.default.query('SELECT * FROM public.profiles WHERE email = $1', [normalizedEmail]);
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
        const isMatch = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid email or password.' });
            return;
        }
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' } // Token expires in 7 days
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
    }
    catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: err.message || 'Login failed.' });
    }
});
// 3. GET /api/auth/me (Check active user session)
router.get('/me', authMiddleware_1.authenticateToken, async (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized.' });
        return;
    }
    try {
        const result = await db_1.default.query('SELECT id, full_name, phone, email, role, created_at FROM public.profiles WHERE id = $1', [req.user.id]);
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
    }
    catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});
exports.default = router;
