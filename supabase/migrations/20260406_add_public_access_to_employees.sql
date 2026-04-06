-- Migration: Add public access to employee profiles for public booking pages
-- This allows unauthenticated users to view employee information when booking appointments
-- Related to: Public employee calendar and booking form

-- Enable RLS on profiles table (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public access to active employee profiles
-- This is needed for public booking pages where clients need to see employee info
CREATE POLICY "profiles_select_public_employees"
ON profiles
FOR SELECT
USING (
  is_active = true 
  AND role = 'employee'
);

-- Note: This policy allows anyone (including unauthenticated users) to:
-- - View employee profiles that are active (is_active = true)
-- - Only for users with role = 'employee'
-- - They CANNOT see other fields like email, phone for non-employee roles
-- - They CANNOT modify any data (SELECT only)
-- - They CANNOT see inactive employees (is_active = false)