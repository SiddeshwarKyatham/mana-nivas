-- WARNING: This will delete ALL users from your Supabase project!
-- Because of CASCADE deletes, this will also automatically delete:
-- 1. All profiles in public.profiles
-- 2. All bookings in public.bookings associated with those users

DELETE FROM auth.users;
