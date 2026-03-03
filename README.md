# Mana Nivas Hotel Booking Application

Frontend-only hotel booking app using React + Vite with Supabase for Auth, Postgres, and Storage.

## Architecture
- Frontend: React + Vite
- Backend: Supabase (Auth + Postgres + Storage)
- Hosting: Vercel

## Prerequisites
- Node.js 18+
- npm
- Supabase project with required tables (`profiles`, `rooms`, `bookings`)

## Environment Setup

Create `client/.env.local`:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Run Locally

```bash
cd client
npm install
npm run dev
```

## URL
- Frontend: `http://localhost:5173`

## Notes
- Booking cancellation is implemented as a status update (`cancelled`), not hard delete.
- No custom server is required.
