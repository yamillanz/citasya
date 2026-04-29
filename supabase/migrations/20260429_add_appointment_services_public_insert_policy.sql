-- Fix: Allow anonymous/public users to insert into appointment_services
-- When a client makes a booking, the app inserts into appointments (which has a public INSERT policy)
-- and then into appointment_services. However, appointment_services was missing a public INSERT policy,
-- causing RLS error 42501 for unauthenticated clients.
CREATE POLICY "appointment_services_public_insert"
  ON public.appointment_services
  FOR INSERT
  TO public
  WITH CHECK (true);
