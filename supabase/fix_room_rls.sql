-- Fix: Drop old restrictive room policies and replace with correct ones

-- 1. Drop ALL existing room policies (old and new names)
DROP POLICY IF EXISTS "Rooms are viewable by everyone." ON public.rooms;
DROP POLICY IF EXISTS "Only admins can modify rooms" ON public.rooms;
DROP POLICY IF EXISTS "rooms_select_all" ON public.rooms;
DROP POLICY IF EXISTS "rooms_insert_admin" ON public.rooms;
DROP POLICY IF EXISTS "rooms_update_admin" ON public.rooms;
DROP POLICY IF EXISTS "rooms_delete_admin" ON public.rooms;

-- 2. Re-create policies correctly
-- Anyone can view rooms (public read)
CREATE POLICY "rooms_select_all" ON public.rooms
  FOR SELECT USING (true);

-- Only admins can insert rooms
CREATE POLICY "rooms_insert_admin" ON public.rooms
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Only admins can update rooms
CREATE POLICY "rooms_update_admin" ON public.rooms
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Only admins can delete rooms
CREATE POLICY "rooms_delete_admin" ON public.rooms
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- 3. Make sure your logged-in user is actually set as admin.
--    Replace the email below with the email you registered with.
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'admin12@gmail.com'
);

-- 4. Verify: run this to confirm your profile shows role = 'admin'
-- SELECT id, full_name, role FROM public.profiles;
