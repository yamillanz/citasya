-- Allow superadmins to update any profile
-- Previously, only the own user or company managers could update employee profiles.
-- Superadmins need to manage all users across companies from the centralized management view.

CREATE POLICY profiles_update_superadmin ON public.profiles
  FOR UPDATE
  USING (get_current_user_role() = 'superadmin')
  WITH CHECK (get_current_user_role() = 'superadmin');