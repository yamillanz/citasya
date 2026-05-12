-- Add payment tracking fields to appointments table
-- Allows managers to mark completed appointments as paid with payment details

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS payment_reference TEXT,
  ADD COLUMN IF NOT EXISTS payment_amount_bs DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ;

COMMENT ON COLUMN appointments.is_paid IS 'Indica si la cita ya fue pagada al empleado';
COMMENT ON COLUMN appointments.payment_method IS 'Método de pago: cash, transfer, mobile_payment, card';
COMMENT ON COLUMN appointments.payment_reference IS 'Número de referencia del pago';
COMMENT ON COLUMN appointments.payment_amount_bs IS 'Monto del pago en bolívares';
COMMENT ON COLUMN appointments.payment_date IS 'Fecha y hora en que se registró el pago';
