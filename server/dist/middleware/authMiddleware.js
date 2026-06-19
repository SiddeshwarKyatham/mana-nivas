"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../db"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || 'mana-nivas-secret-key-123';
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
    if (!token) {
        res.status(401).json({ error: 'Access token required.' });
        return;
    }
    try {
        // Verify local JWT
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (!decoded || !decoded.id) {
            res.status(403).json({ error: 'Invalid or expired token.' });
            return;
        }
        // Fetch user details from Neon Postgres public.profiles
        const result = await db_1.default.query('SELECT id, role FROM public.profiles WHERE id = $1', [decoded.id]);
        if (result.rows.length === 0) {
            res.status(403).json({ error: 'User profile not found.' });
            return;
        }
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: result.rows[0].role,
        };
        next();
    }
    catch (err) {
        console.error('JWT verification error:', err);
        res.status(403).json({ error: 'Invalid or expired token.' });
    }
};
exports.authenticateToken = authenticateToken;
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
