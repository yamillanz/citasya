-- Migration: Seed horarios para Test Business
-- Estos horarios son necesarios para que el sistema pueda calcular disponibilidad

-- Insertar horarios de ejemplo para Test Business
-- Lunes a Viernes: 9:00 - 18:00
INSERT INTO schedules (id, company_id, day_of_week, start_time, end_time, is_active) VALUES
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', 1, '09:00:00', '18:00:00', true),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', 2, '09:00:00', '18:00:00', true),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', 3, '09:00:00', '18:00:00', true),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', 4, '09:00:00', '18:00:00', true),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', 5, '09:00:00', '18:00:00', true);

-- Sábado: 10:00 - 15:00
INSERT INTO schedules (id, company_id, day_of_week, start_time, end_time, is_active) VALUES
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', 6, '10:00:00', '15:00:00', true);

-- Nota: 
-- day_of_week: 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
-- Los horarios definen cuándo la empresa está abierta
-- Los slots disponibles se calculan basándose en estos horarios