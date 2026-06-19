"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../db"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// 1. GET all user profiles (admin only)
router.get('/', authMiddleware_1.authenticateToken, authMiddleware_1.requireAdmin, async (req, res) => {
    try {
        const result = await db_1.default.query('SELECT id, full_name, phone, role, created_at FROM public.profiles ORDER BY created_at DESC');
        res.json(result.rows);
    }
    catch (err) {
        console.error('Error fetching user profiles:', err);
        res.status(500).json({ error: err.message || 'Failed to fetch profiles' });
    }
});
// 2. GET current user's profile
router.get('/profile', authMiddleware_1.authenticateToken, async (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized.' });
        return;
    }
    try {
        const result = await db_1.default.query('SELECT id, full_name, phone, role, created_at FROM public.profiles WHERE id = $1', [req.user.id]);
        if (result.rows.length === 0) {
            // Fallback: create default profile if it's missing in Neon
            const createRes = await db_1.default.query(`INSERT INTO public.profiles (id, full_name, phone, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, full_name, phone, role, created_at`, [req.user.id, 'Guest User', '', 'user']);
            res.json(createRes.rows[0]);
            return;
        }
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).json({ error: err.message || 'Failed to fetch profile' });
    }
});
// 3. GET user profile by ID (either owner or admin)
router.get('/profile/:id', authMiddleware_1.authenticateToken, async (req, res) => {
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
        const result = await db_1.default.query('SELECT id, full_name, phone, role, created_at FROM public.profiles WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Profile not found.' });
            return;
        }
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error('Error fetching profile by ID:', err);
        res.status(500).json({ error: err.message || 'Failed to fetch profile' });
    }
});
// 4. PUT update user profile (owner or admin)
router.put('/profile', authMiddleware_1.authenticateToken, async (req, res) => {
    const { full_name, phone } = req.body;
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized.' });
        return;
    }
    try {
        const result = await db_1.default.query(`UPDATE public.profiles
       SET full_name = COALESCE($1, full_name),
           phone = COALESCE($2, phone)
       WHERE id = $3
       RETURNING id, full_name, phone, role, created_at`, [full_name, phone, req.user.id]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Profile not found.' });
            return;
        }
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ error: err.message || 'Failed to update profile' });
    }
});
exports.default = router;
