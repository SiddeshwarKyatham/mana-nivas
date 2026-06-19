import pool from './db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const schemaDDL = `
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  full_name text,
  phone text,
  email text UNIQUE,
  password_hash text,
  role text DEFAULT 'user'::text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Ensure profiles columns exist if profiles table was previously created
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_hash text;


-- Create rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL,
  description text,
  price numeric NOT NULL,
  amenities text[] DEFAULT '{}',
  images text[] DEFAULT '{}',
  status text DEFAULT 'active',
  capacity integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  room_id uuid REFERENCES public.rooms(id) ON DELETE CASCADE,
  check_in date NOT NULL,
  check_out date NOT NULL,
  status text DEFAULT 'pending',
  total_price numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
`;

const seedRooms = `
INSERT INTO public.rooms (name, type, description, price, amenities, images, status, capacity)
VALUES
(
  'Ocean Pearl Suite',
  'Suite',
  'Spacious sea-facing suite with private balcony and premium lounge access.',
  18999,
  ARRAY['King Bed', 'Sea View', 'Breakfast Included', 'Free WiFi', 'Smart TV', 'Mini Bar'],
  ARRAY[
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1400&q=80'
  ],
  'active',
  2
),
(
  'Heritage Deluxe',
  'Deluxe',
  'Elegant heritage-style room with handcrafted interiors and courtyard view.',
  12999,
  ARRAY['Queen Bed', 'Courtyard View', 'Air Conditioning', 'Free WiFi', 'Work Desk'],
  ARRAY[
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?auto=format&fit=crop&w=1400&q=80'
  ],
  'active',
  2
),
(
  'Garden Family Room',
  'Family',
  'Comfortable family room with garden access and extra seating area.',
  14999,
  ARRAY['2 Queen Beds', 'Garden View', 'Breakfast Included', 'Free WiFi', 'Tea/Coffee Maker'],
  ARRAY[
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1616594039964-3d6c9f7f0fd7?auto=format&fit=crop&w=1400&q=80'
  ],
  'active',
  4
),
(
  'Skyline Executive',
  'Deluxe',
  'Modern high-floor room with city skyline views and ergonomic workspace.',
  13999,
  ARRAY['King Bed', 'City View', 'Free WiFi', 'Smart TV', 'Workspace'],
  ARRAY[
    'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=1400&q=80'
  ],
  'active',
  2
),
(
  'Presidential Panorama',
  'Presidential',
  'Ultra-luxury presidential suite with panoramic views and private lounge.',
  39999,
  ARRAY['Master Suite', 'Panoramic View', 'Butler Service', 'Jacuzzi', 'Private Dining'],
  ARRAY[
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1400&q=80'
  ],
  'active',
  3
),
(
  'Classic Standard',
  'Standard',
  'Cozy and affordable room for short stays with all essential comforts.',
  8999,
  ARRAY['Queen Bed', 'Free WiFi', 'Air Conditioning', 'Hot Shower'],
  ARRAY[
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1400&q=80'
  ],
  'active',
  2
);
`;

async function main() {
  console.log('Starting Neon Postgres database initialization...');
  
  // Create connection client from pool
  let client;
  try {
    client = await pool.connect();
    
    // 1. Run tables creation schema
    console.log('Creating tables in schema public...');
    await client.query(schemaDDL);
    console.log('Tables (profiles, rooms, bookings) created successfully.');

    // 2. Check if rooms are already populated
    const roomsCountRes = await client.query('SELECT COUNT(*) FROM public.rooms');
    const roomsCount = parseInt(roomsCountRes.rows[0].count, 10);
    
    if (roomsCount === 0) {
      console.log('Seeding sample rooms data...');
      await client.query(seedRooms);
      console.log('Rooms seeded successfully.');
    } else {
      console.log('Rooms table already contains data. Skipping seeding.');
    }

    // 3. Seed default admin profile if it doesn't exist
    const adminEmail = 'admin12@gmail.com';
    const adminCheck = await client.query('SELECT id FROM public.profiles WHERE email = $1', [adminEmail]);
    if (adminCheck.rows.length === 0) {
      console.log('Seeding default admin profile...');
      const adminId = crypto.randomUUID();
      const passwordHash = await bcrypt.hash('admin123', 10);
      await client.query(
        `INSERT INTO public.profiles (id, full_name, phone, email, password_hash, role)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [adminId, 'Admin User', '1234567890', adminEmail, passwordHash, 'admin']
      );
      console.log('Admin profile seeded successfully. (Email: admin12@gmail.com, Password: admin123)');
    } else {
      console.log('Admin profile already exists.');
    }
    
    console.log('Database initialization completed successfully!');
  } catch (err) {
    console.error('Error during database setup:', err);
  } finally {
    if (client) {
      client.release();
    }
    pool.end();
    process.exit(0);
  }
}

main();
