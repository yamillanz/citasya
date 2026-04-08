-- Create appointment_services table for many-to-many relationship
CREATE TABLE appointment_services (
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (appointment_id, service_id)
);

-- Create indexes for performance
CREATE INDEX idx_appointment_services_appointment ON appointment_services(appointment_id);
CREATE INDEX idx_appointment_services_service ON appointment_services(service_id);

-- Enable Row Level Security
ALTER TABLE appointment_services ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view services for their own appointments
CREATE POLICY "Users can view appointment_services for their appointments"
  ON appointment_services FOR SELECT
  USING (appointment_id IN (
    SELECT id FROM appointments WHERE employee_id = auth.uid()
  ));

-- RLS Policy: Public can insert services for new appointments
CREATE POLICY "Public can insert appointment_services for new appointments"
  ON appointment_services FOR INSERT
  WITH CHECK (appointment_id IN (
    SELECT id FROM appointments WHERE status = 'pending'
  ));

-- RLS Policy: Users can delete services for their appointments
CREATE POLICY "Users can delete appointment_services for their appointments"
  ON appointment_services FOR DELETE
  USING (appointment_id IN (
    SELECT id FROM appointments WHERE employee_id = auth.uid()
  ));