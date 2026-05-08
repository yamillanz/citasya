-- Fix: Allow public access to managers with can_be_employee = true
-- Previously only role = 'employee' was allowed, causing "Professional Not Found"
-- when a manager with can_be_employee tried to share their public calendar link

DROP POLICY IF EXISTS "profiles_select_public_employees" ON profiles;

CREATE POLICY "profiles_select_public_employees"
ON profiles
FOR SELECT
USING (
  is_active = true
  AND (
    role = 'employee'
    OR (role = 'manager' AND can_be_employee = true)
  )
);