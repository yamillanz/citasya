-- Fix: Allow public access to appointments for managers with can_be_employee = true
-- Previously only role = 'employee' was allowed, blocking appointment visibility
-- for managers who also act as employees on public booking/calendar pages

DROP POLICY IF EXISTS "appointments_select_public" ON appointments;

CREATE POLICY "appointments_select_public"
ON appointments
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id = appointments.employee_id
    AND p.is_active = true
    AND (
      p.role = 'employee'
      OR (p.role = 'manager' AND p.can_be_employee = true)
    )
  )
);