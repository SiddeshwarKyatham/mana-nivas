-- Run this script in your Supabase SQL Editor to seed an admin user

-- Enable pgcrypto if not already enabled (required for password encryption)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  new_admin_id uuid := gen_random_uuid();
  admin_email text := 'admin@mananivas.com';
  admin_password text := 'admin1234';
BEGIN
  -- 1. Check if user already exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
    -- Insert into auth.users (Supabase's built-in authentication table)
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin
    ) VALUES (
      new_admin_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      admin_email,
      crypt(admin_password, gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name": "Super Admin"}',
      false
    );

    -- 1b. Insert into auth.identities (Required for login in newer Supabase versions)
    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      new_admin_id,
      new_admin_id,
      format('{"sub":"%s","email":"%s"}', new_admin_id::text, admin_email)::jsonb,
      'email',
      now(),
      now(),
      now()
    );
  END IF;

  -- 2. Because of our trigger on_auth_user_created, the public.profiles row
  -- was automatically created with the role 'user'.
  -- We just need to update that profile to be an 'admin'.
  UPDATE public.profiles
  SET role = 'admin'
  WHERE id = (SELECT id FROM auth.users WHERE email = admin_email);

END $$;
