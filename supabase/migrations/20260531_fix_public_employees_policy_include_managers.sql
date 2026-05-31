-- Fix regression: The 20260531_update_public_employees_policy migration
-- accidentally removed the clause that allows managers with can_be_employee=true
-- from appearing in public employee listings (/c/:company_slug).
--
-- This restores the fix from 20260508 while keeping the not_available filter
-- and the TO anon,authenticated scope from 20260531.

DROP POLICY IF EXISTS profiles_select_public_employees ON profiles;

CREATE POLICY profiles_select_public_employees ON profiles
  FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true
    AND not_available = false
    AND (
      role = 'employee'
      OR (role = 'manager' AND can_be_employee = true)
    )
  );
