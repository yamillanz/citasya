-- Seed appointments for employee yamil.w.lanz@gmail.com
-- 4 appointments in March 2026, 6 appointments in February 2026

-- First, create services for the company
INSERT INTO services (id, company_id, name, duration_minutes, price, is_active)
VALUES 
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Corte de cabello', 30, 25.00, true),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Afeitado', 20, 15.00, true),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Perfilado de barba', 15, 10.00, true);

-- Create employee_services associations
INSERT INTO employee_services (employee_id, service_id)
SELECT 'c1f15acd-faed-4b7d-a274-594217f93072', id FROM services WHERE company_id = 'a0000000-0000-0000-0000-000000000001';

-- Appointments in February 2026 (previous month) - 6 appointments
INSERT INTO appointments (company_id, employee_id, service_id, client_name, client_phone, client_email, appointment_date, appointment_time, status, amount_collected)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'c1f15acd-faed-4b7d-a274-594217f93072', 'b0000000-0000-0000-0000-000000000001', 'Carlos Mendoza', '+1234567890', 'carlos.mendoza@email.com', '2026-02-05', '09:00', 'completed', 25.00),
  ('a0000000-0000-0000-0000-000000000001', 'c1f15acd-faed-4b7d-a274-594217f93072', 'b0000000-0000-0000-0000-000000000002', 'Maria Garcia', '+1234567891', 'maria.garcia@email.com', '2026-02-10', '11:30', 'completed', 15.00),
  ('a0000000-0000-0000-0000-000000000001', 'c1f15acd-faed-4b7d-a274-594217f93072', 'b0000000-0000-0000-0000-000000000003', 'Juan Rodriguez', '+1234567892', 'juan.rodriguez@email.com', '2026-02-15', '14:00', 'pending', 10.00),
  ('a0000000-0000-0000-0000-000000000001', 'c1f15acd-faed-4b7d-a274-594217f93072', 'b0000000-0000-0000-0000-000000000001', 'Laura Fernandez', '+1234567893', 'laura.fernandez@email.com', '2026-02-20', '16:30', 'cancelled', 0.00),
  ('a0000000-0000-0000-0000-000000000001', 'c1f15acd-faed-4b7d-a274-594217f93072', 'b0000000-0000-0000-0000-000000000002', 'Pedro Sanchez', '+1234567894', 'pedro.sanchez@email.com', '2026-02-25', '10:00', 'completed', 15.00),
  ('a0000000-0000-0000-0000-000000000001', 'c1f15acd-faed-4b7d-a274-594217f93072', 'b0000000-0000-0000-0000-000000000001', 'Ana Martinez', '+1234567895', 'ana.martinez@email.com', '2026-02-28', '13:15', 'no_show', 25.00);

-- Appointments in March 2026 (current month) - 4 appointments
INSERT INTO appointments (company_id, employee_id, service_id, client_name, client_phone, client_email, appointment_date, appointment_time, status, amount_collected)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'c1f15acd-faed-4b7d-a274-594217f93072', 'b0000000-0000-0000-0000-000000000001', 'Roberto Diaz', '+1234567896', 'roberto.diaz@email.com', '2026-03-05', '09:30', 'completed', 25.00),
  ('a0000000-0000-0000-0000-000000000001', 'c1f15acd-faed-4b7d-a274-594217f93072', 'b0000000-0000-0000-0000-000000000002', 'Sofia Lopez', '+1234567897', 'sofia.lopez@email.com', '2026-03-12', '11:00', 'pending', 15.00),
  ('a0000000-0000-0000-0000-000000000001', 'c1f15acd-faed-4b7d-a274-594217f93072', 'b0000000-0000-0000-0000-000000000003', 'Diego Ramirez', '+1234567898', 'diego.ramirez@email.com', '2026-03-19', '15:30', 'pending', 10.00),
  ('a0000000-0000-0000-0000-000000000001', 'c1f15acd-faed-4b7d-a274-594217f93072', 'b0000000-0000-0000-0000-000000000001', 'Carmen Torres', '+1234567899', 'carmen.torres@email.com', '2026-03-26', '17:00', 'pending', 25.00);
