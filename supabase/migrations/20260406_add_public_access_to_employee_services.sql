-- Migration: Add public access to employee_services for public booking pages
-- This allows unauthenticated users to see which services an employee offers
-- Related to: Public employee calendar and booking form

-- Enable RLS on employee_services table (if not already enabled)
ALTER TABLE employee_services ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public access to employee_services
-- This is needed for public booking pages where clients need to see available services
CREATE POLICY "employee_services_select_public"
ON employee_services
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM profiles p
    WHERE p.id = employee_services.employee_id
    AND p.is_active = true
    AND p.role = 'employee'
  )
);

-- Note: This policy allows anyone (including unauthenticated users) to:
-- - View employee_services records for active employees
-- - This enables showing which services an employee offers on public pages
-- - They CANNOT see relations for inactive employees
-- - They CANNOT modify any data (SELECT only)