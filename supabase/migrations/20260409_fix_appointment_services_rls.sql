-- Fix RLS policies for appointment_services to allow company managers to view services
-- Drop the restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view appointment_services for their appointments" ON appointment_services;

-- New policy: Allow users to view appointment_services for:
-- 1. Their own appointments (employees)
-- 2. Appointments in their company (managers/owners)
CREATE POLICY "Users can view appointment_services"
  ON appointment_services FOR SELECT
  USING (
    -- Employee can see their own appointments
    appointment_id IN (
      SELECT id FROM appointments WHERE employee_id = auth.uid()
    )
    OR
    -- Company members can see all appointments in their company
    appointment_id IN (
      SELECT a.id FROM appointments a
      JOIN profiles p ON p.id = auth.uid()
      WHERE a.company_id = p.company_id
    )
  );

-- Also fix INSERT policy to be more permissive for company members
DROP POLICY IF EXISTS "Public can insert appointment_services for new appointments" ON appointment_services;

CREATE POLICY "Users can insert appointment_services"
  ON appointment_services FOR INSERT
  WITH CHECK (
    -- Allow insert for pending appointments in user's company
    appointment_id IN (
      SELECT a.id FROM appointments a
      JOIN profiles p ON p.id = auth.uid()
      WHERE a.company_id = p.company_id
    )
  );

-- Fix DELETE policy similarly
DROP POLICY IF EXISTS "Users can delete services for their appointments" ON appointment_services;

CREATE POLICY "Users can delete appointment_services"
  ON appointment_services FOR DELETE
  USING (
    appointment_id IN (
      SELECT id FROM appointments WHERE employee_id = auth.uid()
    )
    OR
    appointment_id IN (
      SELECT a.id FROM appointments a
      JOIN profiles p ON p.id = auth.uid()
      WHERE a.company_id = p.company_id
    )
  );
