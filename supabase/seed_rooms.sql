-- Seed sample rooms for initial frontend view
-- Run this in Supabase SQL Editor

insert into public.rooms (
  name,
  type,
  description,
  price,
  amenities,
  images,
  status,
  capacity
)
values
(
  'Ocean Pearl Suite',
  'Suite',
  'Spacious sea-facing suite with private balcony and premium lounge access.',
  18999,
  array['King Bed', 'Sea View', 'Breakfast Included', 'Free WiFi', 'Smart TV', 'Mini Bar']::text[],
  array[
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1400&q=80'
  ]::text[],
  'active',
  2
),
(
  'Heritage Deluxe',
  'Deluxe',
  'Elegant heritage-style room with handcrafted interiors and courtyard view.',
  12999,
  array['Queen Bed', 'Courtyard View', 'Air Conditioning', 'Free WiFi', 'Work Desk']::text[],
  array[
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?auto=format&fit=crop&w=1400&q=80'
  ]::text[],
  'active',
  2
),
(
  'Garden Family Room',
  'Family',
  'Comfortable family room with garden access and extra seating area.',
  14999,
  array['2 Queen Beds', 'Garden View', 'Breakfast Included', 'Free WiFi', 'Tea/Coffee Maker']::text[],
  array[
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1616594039964-3d6c9f7f0fd7?auto=format&fit=crop&w=1400&q=80'
  ]::text[],
  'active',
  4
),
(
  'Skyline Executive',
  'Deluxe',
  'Modern high-floor room with city skyline views and ergonomic workspace.',
  13999,
  array['King Bed', 'City View', 'Free WiFi', 'Smart TV', 'Workspace']::text[],
  array[
    'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=1400&q=80'
  ]::text[],
  'active',
  2
),
(
  'Presidential Panorama',
  'Presidential',
  'Ultra-luxury presidential suite with panoramic views and private lounge.',
  39999,
  array['Master Suite', 'Panoramic View', 'Butler Service', 'Jacuzzi', 'Private Dining']::text[],
  array[
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1400&q=80'
  ]::text[],
  'active',
  3
),
(
  'Classic Standard',
  'Standard',
  'Cozy and affordable room for short stays with all essential comforts.',
  8999,
  array['Queen Bed', 'Free WiFi', 'Air Conditioning', 'Hot Shower']::text[],
  array[
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1400&q=80'
  ]::text[],
  'active',
  2
);
