-- Migration: Add test users for MVP deep testing
-- Date: 2026-03-24
-- Users:
--   - yamil.lanz@gmail.com (Super Admin)
--   - negociosyelp@gmail.com (Manager) 
--   - yamil.w.lanz@gmail.com (Employee)

-- Step 1: Create a test company for Manager and Employee
INSERT INTO public.companies (id, name, slug, address, phone, plan_id, is_active)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Test Business',
  'test-business',
  '123 Test Street',
  '+1234567890',
  'c23bcd96-b116-422b-9c70-0350a546efa6', -- Básico plan
  true
);

-- Step 2: Create user profiles
-- NOTE: The id must match an existing auth.users.id
-- Process:
--   1. First create auth.users in Supabase Dashboard > Authentication > Users > Add User
--   2. Copy the returned UUID
--   3. Update the profile insert with that UUID
--   4. Run this migration

-- Super Admin (no company_id)
INSERT INTO public.profiles (id, email, full_name, role, company_id, is_active)
VALUES (
  '51b4cd23-640c-436d-ac03-576b89318b1b',
  'yamil.lanz@gmail.com',
  'Yamil Lanz',
  'superadmin',
  NULL,
  true
);

-- Manager (with company)
INSERT INTO public.profiles (id, email, full_name, role, company_id, is_active)
VALUES (
  '4422e64c-283e-4e4d-a88e-d8e8e21ac5c6',
  'negociosyelp@gmail.com',
  'Negocios Yelpr',
  'manager',
  'a0000000-0000-0000-0000-000000000001',
  true
);

-- Employee (with company)
INSERT INTO public.profiles (id, email, full_name, role, company_id, is_active)
VALUES (
  'c1f15acd-faed-4b7d-a274-594217f93072',
  'yamil.w.lanz@gmail.com',
  'Yamil Lanz Worker',
  'employee',
  'a0000000-0000-0000-0000-000000000001',
  true
);
