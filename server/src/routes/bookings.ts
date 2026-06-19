import express, { Response } from 'express';
import pool from '../db';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = express.Router();

// 1. GET bookings (user gets their own, admin gets all)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  try {
    if (req.user.role === 'admin') {
      const query = `
        SELECT b.id, b.check_in, b.check_out, b.total_price, b.status, b.created_at,
          CASE 
            WHEN p.id IS NOT NULL THEN json_build_object('id', p.id, 'full_name', p.full_name, 'phone', p.phone)
            ELSE NULL
          END as profiles,
          CASE 
            WHEN r.id IS NOT NULL THEN json_build_object('id', r.id, 'name', r.name, 'type', r.type)
            ELSE NULL
          END as rooms
        FROM public.bookings b
        LEFT JOIN public.profiles p ON b.user_id = p.id
        LEFT JOIN public.rooms r ON b.room_id = r.id
        ORDER BY b.created_at DESC
      `;
      const result = await pool.query(query);
      res.json(result.rows);
    } else {
      const query = `
        SELECT b.id, b.user_id, b.room_id, b.check_in, b.check_out, b.total_price, b.status, b.created_at,
          CASE 
            WHEN r.id IS NOT NULL THEN json_build_object('id', r.id, 'name', r.name, 'type', r.type, 'price', r.price, 'description', r.description, 'amenities', r.amenities, 'images', r.images)
            ELSE NULL
          END as room
        FROM public.bookings b
        LEFT JOIN public.rooms r ON b.room_id = r.id
        WHERE b.user_id = $1
        ORDER BY b.created_at DESC
      `;
      const result = await pool.query(query, [req.user.id]);
      res.json(result.rows);
    }
  } catch (err: any) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch bookings' });
  }
});

// 1.5. GET check availability (public)
router.get('/check-availability', async (req, res: Response) => {
  const { room_id, check_in, check_out } = req.query;
  if (!room_id || !check_in || !check_out) {
    res.status(400).json({ error: 'room_id, check_in, and check_out are required.' });
    return;
  }
  try {
    const query = `
      SELECT id FROM public.bookings
      WHERE room_id = $1
        AND status != 'cancelled'
        AND check_in < $2
        AND check_out > $3
      LIMIT 1
    `;
    const result = await pool.query(query, [room_id, check_out, check_in]);
    const available = result.rows.length === 0;
    res.json({ available });
  } catch (err: any) {
    console.error('Error checking availability:', err);
    res.status(500).json({ error: err.message || 'Failed to check availability' });
  }
});

// 2. GET a single booking by ID
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  try {
    const query = `
      SELECT b.id, b.user_id, b.room_id, b.check_in, b.check_out, b.total_price, b.status, b.created_at,
        CASE 
          WHEN r.id IS NOT NULL THEN json_build_object('id', r.id, 'name', r.name, 'type', r.type, 'price', r.price, 'description', r.description, 'amenities', r.amenities, 'images', r.images)
          ELSE NULL
        END as room
      FROM public.bookings b
      LEFT JOIN public.rooms r ON b.room_id = r.id
      WHERE b.id = $1
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Booking not found.' });
      return;
    }

    const booking = result.rows[0];

    // Enforce authorization
    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
      res.status(403).json({ error: 'Access denied. You can only view your own bookings.' });
      return;
    }

    res.json(booking);
  } catch (err: any) {
    console.error('Error fetching booking details:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch booking details' });
  }
});

// 3. POST create a new booking
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { room_id, check_in, check_out, total_price } = req.body;
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  if (!room_id || !check_in || !check_out || total_price === undefined) {
    res.status(400).json({ error: 'Missing booking details.' });
    return;
  }

  try {
    const query = `
      INSERT INTO public.bookings (user_id, room_id, check_in, check_out, total_price, status)
      VALUES ($1, $2, $3, $4, $5, 'booked')
      RETURNING *
    `;
    const result = await pool.query(query, [req.user.id, room_id, check_in, check_out, total_price]);
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error('Error creating booking:', err);
    res.status(500).json({ error: err.message || 'Failed to create booking' });
  }
});

// 4. PUT update/cancel a booking
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, check_in, check_out, total_price } = req.body;
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  try {
    // Check if booking exists and check user access
    const checkQuery = 'SELECT user_id, status FROM public.bookings WHERE id = $1';
    const checkRes = await pool.query(checkQuery, [id]);

    if (checkRes.rows.length === 0) {
      res.status(404).json({ error: 'Booking not found.' });
      return;
    }

    const existingBooking = checkRes.rows[0];

    // Regular users can only modify/cancel their own bookings
    if (req.user.role !== 'admin' && existingBooking.user_id !== req.user.id) {
      res.status(403).json({ error: 'Access denied.' });
      return;
    }

    let query: string;
    let values: any[];

    if (req.user.role === 'admin') {
      // Admin can update status and check-in/out info
      query = `
        UPDATE public.bookings
        SET status = COALESCE($1, status),
            check_in = COALESCE($2, check_in),
            check_out = COALESCE($3, check_out),
            total_price = COALESCE($4, total_price)
        WHERE id = $5
        RETURNING *
      `;
      values = [status, check_in, check_out, total_price, id];
    } else {
      // User can only cancel or update their own checkin/checkout dates
      query = `
        UPDATE public.bookings
        SET status = COALESCE($1, status),
            check_in = COALESCE($2, check_in),
            check_out = COALESCE($3, check_out),
            total_price = COALESCE($4, total_price)
        WHERE id = $5 AND user_id = $6
        RETURNING *
      `;
      values = [status, check_in, check_out, total_price, id, req.user.id];
    }

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err: any) {
    console.error('Error updating booking:', err);
    res.status(500).json({ error: err.message || 'Failed to update booking' });
  }
});

export default router;
