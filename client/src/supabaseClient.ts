import { createClient } from '@supabase/supabase-js';

// Add these to your frontend .env file (for Vite):
// VITE_SUPABASE_URL=https://your-project-ref.supabase.co
// VITE_SUPABASE_ANON_KEY=your-anon-public-key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
