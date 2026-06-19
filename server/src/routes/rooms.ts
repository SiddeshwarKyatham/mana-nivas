import express, { Response } from 'express';
import pool from '../db';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = express.Router();

// 1. GET all rooms (public)
router.get('/', async (req, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM public.rooms ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching rooms:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch rooms' });
  }
});

// 2. GET a specific room (public)
router.get('/:id', async (req, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM public.rooms WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Room not found.' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err: any) {
    console.error('Error fetching room details:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch room details' });
  }
});

// 2.5. GET active bookings for a room (public - for calendar display)
router.get('/:id/bookings', async (req, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT check_in, check_out FROM public.bookings WHERE room_id = $1 AND status != 'cancelled'",
      [id]
    );
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching room bookings:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch room bookings' });
  }
});

// 3. POST add a new room (admin only)
router.post('/', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { name, type, description, price, amenities, images, status, capacity } = req.body;

  if (!name || !type || price === undefined) {
    res.status(400).json({ error: 'Name, type, and price are required.' });
    return;
  }

  try {
    const query = `
      INSERT INTO public.rooms (name, type, description, price, amenities, images, status, capacity)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      name,
      type,
      description || '',
      price,
      amenities || [],
      images || [],
      status || 'active',
      capacity || 1,
    ];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error('Error creating room:', err);
    res.status(500).json({ error: err.message || 'Failed to create room' });
  }
});

// 4. PUT update a room (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, type, description, price, amenities, images, status, capacity } = req.body;

  try {
    const existing = await pool.query('SELECT * FROM public.rooms WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      res.status(404).json({ error: 'Room not found.' });
      return;
    }

    const query = `
      UPDATE public.rooms
      SET name = COALESCE($1, name),
          type = COALESCE($2, type),
          description = COALESCE($3, description),
          price = COALESCE($4, price),
          amenities = COALESCE($5, amenities),
          images = COALESCE($6, images),
          status = COALESCE($7, status),
          capacity = COALESCE($8, capacity)
      WHERE id = $9
      RETURNING *
    `;
    const values = [
      name !== undefined ? name : null,
      type !== undefined ? type : null,
      description !== undefined ? description : null,
      price !== undefined ? price : null,
      amenities !== undefined ? amenities : null,
      images !== undefined ? images : null,
      status !== undefined ? status : null,
      capacity !== undefined ? capacity : null,
      id,
    ];

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err: any) {
    console.error('Error updating room:', err);
    res.status(500).json({ error: err.message || 'Failed to update room' });
  }
});

// 5. DELETE a room (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM public.rooms WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Room not found.' });
      return;
    }
    res.json({ message: 'Room deleted successfully.', room: result.rows[0] });
  } catch (err: any) {
    console.error('Error deleting room:', err);
    res.status(500).json({ error: err.message || 'Failed to delete room' });
  }
});

export default router;
