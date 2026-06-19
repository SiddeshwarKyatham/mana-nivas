import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import roomsRouter from './routes/rooms';
import bookingsRouter from './routes/bookings';
import usersRouter from './routes/users';
import authRouter from './routes/auth';
import uploadRouter from './routes/upload';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with support for dynamic client URLs
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/rooms', uploadRouter); // Mount POST /api/rooms/upload
app.use('/api/rooms', roomsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/users', usersRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Mana Nivas API server is running.' });
});

// Root route
app.get('/', (req, res) => {
  res.send('Mana Nivas Backend Server is Active.');
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
