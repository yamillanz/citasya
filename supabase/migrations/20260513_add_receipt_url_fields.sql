-- ============================================================================
-- Migration: Add receipt URL fields to appointments
-- Date: 2026-05-13
-- Purpose: Allow managers to attach receipt/voucher images when completing
--          an appointment and when registering a payment to an employee.
-- ============================================================================

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS receipt_url TEXT,
  ADD COLUMN IF NOT EXISTS payment_receipt_url TEXT;

COMMENT ON COLUMN appointments.receipt_url IS 'URL del comprobante adjuntado al completar la cita';
COMMENT ON COLUMN appointments.payment_receipt_url IS 'URL del comprobante de pago al empleado';
