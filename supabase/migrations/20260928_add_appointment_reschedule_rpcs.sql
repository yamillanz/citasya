-- ============================================================================
-- CitasYa - Paso 1/2: RPCs de reprogramación por token (sin login)
--
-- ✅ SEGURO EJECUTAR AHORA MISMO (SQL Editor de Supabase o psql).
--    Solo crea funciones y otorga EXECUTE: no cambia privilegios existentes
--    sobre la tabla appointments, no rompe ninguna consulta actual.
--
-- Requisito previo: ninguno. Es idempotente (CREATE OR REPLACE).
-- Verificación sugerida tras ejecutar:
--   select * from get_appointment_by_token('<token-real>');       -- 1 fila
--   select * from get_appointment_by_token('token-inexistente');  -- 0 filas
--   begin;
--     select * from reschedule_appointment_by_token('<token>', current_date + 5, '15:00');
--   rollback;   -- prueba atómica sin tocar datos
--
-- ⚠️ El secreto del token (REVOKE/GRANT de columnas) está en el PASO 2/2 y
--    SOLO debe ejecutarse después de desplegar el frontend nuevo.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Lectura: cita + servicios + empresa + empleado, acotada por token
-- Devuelve ninguna fila para un token desconocido (no lanza error).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_appointment_by_token(p_token text)
RETURNS TABLE (
  id UUID,
  company_id UUID,
  employee_id UUID,
  client_name TEXT,
  appointment_date DATE,
  appointment_time TIME,
  status TEXT,
  notes TEXT,
  company_name TEXT,
  company_address TEXT,
  company_phone TEXT,
  employee_name TEXT,
  services JSONB,
  total_duration INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_appointment appointments%ROWTYPE;
BEGIN
  SELECT * INTO v_appointment
  FROM appointments
  WHERE cancellation_token = p_token
    AND cancellation_token IS NOT NULL;

  -- Token desconocido: sin filas (no error)
  IF NOT FOUND THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    a.id,
    a.company_id,
    a.employee_id,
    a.client_name,
    a.appointment_date,
    a.appointment_time,
    a.status,
    a.notes,
    c.name,
    c.address,
    c.phone,
    e.full_name,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'name', s.name,
            'duration_minutes', s.duration_minutes,
            'price', s.price
          )
        )
        FROM appointment_services aps
        JOIN services s ON s.id = aps.service_id
        WHERE aps.appointment_id = a.id
      ),
      '[]'::jsonb
    ),
    COALESCE(
      (
        SELECT SUM(s.duration_minutes)::int
        FROM appointment_services aps
        JOIN services s ON s.id = aps.service_id
        WHERE aps.appointment_id = a.id
      ),
      0
    )
  FROM appointments a
  JOIN companies c ON c.id = a.company_id
  LEFT JOIN profiles e ON e.id = a.employee_id
  WHERE a.id = v_appointment.id;
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. Escritura: reprogramación atómica validando token, estado, fecha y solapamiento
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION reschedule_appointment_by_token(
  p_token text,
  p_date date,
  p_time time
)
RETURNS appointments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_appointment appointments%ROWTYPE;
  v_updated appointments%ROWTYPE;
  v_duration INT;
  v_employee_is_bookable BOOLEAN;
BEGIN
  -- 1. Lock pesimista sobre la fila del token
  SELECT * INTO v_appointment
  FROM appointments
  WHERE cancellation_token = p_token
    AND cancellation_token IS NOT NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Enlace inválido o cita no encontrada';
  END IF;

  -- 2. Solo citas pendientes pueden moverse
  IF v_appointment.status <> 'pending' THEN
    RAISE EXCEPTION 'Esta cita ya no se puede reprogramar';
  END IF;

  -- 3. Fecha/hora futura
  IF NOT (
    p_date > CURRENT_DATE
    OR (p_date = CURRENT_DATE AND p_time > LOCALTIME)
  ) THEN
    RAISE EXCEPTION 'La nueva fecha debe ser futura';
  END IF;

  -- 4. El empleado debe seguir siendo reservable
  SELECT COALESCE(p.is_active, false) AND COALESCE(NOT p.not_available, true)
  INTO v_employee_is_bookable
  FROM profiles p
  WHERE p.id = v_appointment.employee_id;

  IF v_employee_is_bookable IS NOT TRUE THEN
    RAISE EXCEPTION 'El profesional no está disponible';
  END IF;

  -- 5. Duración total: suma de appointment_services, fallback service_id, fallback 30
  SELECT COALESCE(SUM(s.duration_minutes), NULL)
  INTO v_duration
  FROM appointment_services aps
  JOIN services s ON s.id = aps.service_id
  WHERE aps.appointment_id = v_appointment.id;

  IF v_duration IS NULL THEN
    SELECT s.duration_minutes INTO v_duration
    FROM services s
    WHERE s.id = v_appointment.service_id;
  END IF;

  IF v_duration IS NULL THEN
    v_duration := 30;
  END IF;

  -- Lock de advisory por empleado + fecha: serializa reschedules concurrentes
  PERFORM pg_advisory_xact_lock(
    hashtext(COALESCE(v_appointment.employee_id::text, '') || p_date::text)
  );

  -- 6. Solapamiento con otras citas no canceladas del mismo empleado
  IF EXISTS (
    SELECT 1
    FROM appointments a
    LEFT JOIN LATERAL (
      SELECT COALESCE(SUM(s.duration_minutes), 0) AS duration
      FROM appointment_services aps
      JOIN services s ON s.id = aps.service_id
      WHERE aps.appointment_id = a.id
    ) dur ON true
    WHERE a.employee_id = v_appointment.employee_id
      AND a.appointment_date = p_date
      AND a.id <> v_appointment.id
      AND a.status <> 'cancelled'
      AND (p_time::time < (a.appointment_time::time + MAKE_INTERVAL(mins => dur.duration)))
      AND ((p_time::time + MAKE_INTERVAL(mins => v_duration)) > a.appointment_time::time)
  ) THEN
    RAISE EXCEPTION 'El horario ya no está disponible';
  END IF;

  -- 7. Actualizar solo fecha y hora en la misma fila
  UPDATE appointments
  SET appointment_date = p_date,
      appointment_time = p_time,
      updated_at = NOW()
  WHERE id = v_appointment.id
  RETURNING * INTO v_updated;

  RETURN v_updated;
END;
$$;

-- ----------------------------------------------------------------------------
-- 3. Permisos de ejecución (aditivo, sin riesgo)
-- ----------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION get_appointment_by_token(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION reschedule_appointment_by_token(text, date, time) TO anon, authenticated;
