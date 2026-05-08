-- Fix: Allow public access to employee_services for managers with can_be_employee = true
-- Previously only role = 'employee' was allowed, blocking services visibility
-- for managers who also act as employees on public booking pages

DROP POLICY IF EXISTS "employee_services_select_public" ON employee_services;

CREATE POLICY "employee_services_select_public"
ON employee_services
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id = employee_services.employee_id
    AND p.is_active = true
    AND (
      p.role = 'employee'
      OR (p.role = 'manager' AND p.can_be_employee = true)
    )
  )
);