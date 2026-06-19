"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.warn('Warning: DATABASE_URL is not set in environment variables.');
}
const pool = new pg_1.Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false // Required for Neon Postgres connections
    }
});
// Test connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error acquiring client:', err.stack);
    }
    else {
        console.log('Successfully connected to Neon Postgres database.');
        release();
    }
});
exports.default = pool;
