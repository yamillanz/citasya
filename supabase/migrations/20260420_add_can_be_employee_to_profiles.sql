-- ============================================================================
-- CitasYa - MIGRACIÓN: Agregar can_be_employee a profiles
-- Fecha: 2026-04-20
-- Descripción: Permite que un manager también actúe como empleado
-- ============================================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS can_be_employee BOOLEAN DEFAULT false;

ALTER TABLE profiles ADD CONSTRAINT can_be_employee_only_for_managers
  CHECK (can_be_employee = false OR role = 'manager');

CREATE OR REPLACE FUNCTION get_current_user_can_be_employee()
RETURNS BOOLEAN AS $$
    SELECT can_be_employee FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

COMMENT ON COLUMN profiles.can_be_employee IS 'Si un manager puede actuar como empleado (prestar servicios)';
