-- ============================================================================
-- CitasYa - Paso 2/2: secreto del token de cancelación/reprogramación
--
-- ⚠️ NO EJECUTAR TODAVÍA. Ejecutar (SQL Editor de Supabase o psql) ÚNICAMENTE
--    después de que el frontend nuevo esté desplegado en producción
--    (frontend consulta columnas explícitas y no pide cancellation_token).
--
-- Por qué: un REVOKE a nivel de columna NO revoca el privilegio a nivel de
-- tabla (Supabase otorga SELECT de tabla a anon por defecto), así que se
-- revoca a nivel tabla y se re-grantan todas las columnas menos el token.
--
-- Requisitos previos:
--   1. Ejecutar antes 20260928_add_appointment_reschedule_rpcs.sql (Paso 1/2).
--   2. Frontend desplegado con la lista explícita de columnas en
--      getByEmployee / getById / create (insert con retorno).
--   3. service_role (edge function) y authenticated (backoffice) no cambian.
--
-- Verificación inmediata después de ejecutar:
--   begin;
--     set local role anon;
--     select cancellation_token from appointments limit 1;  -- ❌ permission denied
--   rollback;
--   -- El booking público y el calendario deben seguir funcionando.
--
-- Rollback:
--   GRANT ALL PRIVILEGES ON appointments TO anon;
--   -- (y revertir el commit del frontend si se necesita volver atrás del todo)
-- ============================================================================

-- El token deja de ser legible por clientes anónimos.
REVOKE ALL PRIVILEGES ON appointments FROM anon;
GRANT INSERT ON appointments TO anon;
GRANT SELECT (
  id, company_id, employee_id, service_id, client_name, client_phone, client_email,
  appointment_date, appointment_time, status, amount_collected, notes,
  is_paid, payment_method, payment_reference, payment_amount_bs, payment_date,
  receipt_url, payment_receipt_url, exchange_rate, amount_in_bs, observations,
  created_at, updated_at
) ON appointments TO anon;
