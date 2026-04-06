-- Migration: Add public read access to appointments for availability calculation
-- This allows unauthenticated users to see appointment slots when viewing employee calendar
-- Related to: Public employee calendar and booking form

-- Enable RLS on appointments table (if not already enabled)
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public SELECT for active employees' appointments
-- This is needed for:
-- 1. Public calendar to show available slots
-- 2. Booking form to calculate availability
CREATE POLICY "appointments_select_public"
ON appointments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM profiles p
    WHERE p.id = appointments.employee_id
    AND p.is_active = true
    AND p.role = 'employee'
  )
);

-- Note: appointments_public_insert already exists for creating appointments
-- This policy allows anyone to:
-- - View appointments for active employees
-- - Only SELECT, no UPDATE or DELETE
-- - Cannot see appointments from inactive employees