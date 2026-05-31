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
