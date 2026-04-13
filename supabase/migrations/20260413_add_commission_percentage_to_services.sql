-- Add commission_percentage to services table
-- This allows configuring the employee commission percentage per service
ALTER TABLE services ADD COLUMN commission_percentage numeric(5,2) NOT NULL DEFAULT 0;

COMMENT ON COLUMN services.commission_percentage IS 'Porcentaje de comisión para el empleado por este servicio (0-100)';