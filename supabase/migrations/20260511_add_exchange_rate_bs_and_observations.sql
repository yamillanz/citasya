-- Add exchange_rate, amount_in_bs and observations columns to appointments table
-- for dual-currency (USD + Bolívares) support and completion observations

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10,4) DEFAULT 1.0000,
  ADD COLUMN IF NOT EXISTS amount_in_bs DECIMAL(10,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS observations TEXT;

COMMENT ON COLUMN appointments.exchange_rate IS 'Tasa de cambio USD a Bolívares al momento de completar la cita';
COMMENT ON COLUMN appointments.amount_in_bs IS 'Monto cobrado en bolívares';
COMMENT ON COLUMN appointments.observations IS 'Observaciones al completar la cita';
