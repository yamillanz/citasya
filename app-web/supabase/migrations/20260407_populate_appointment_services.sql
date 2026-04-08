-- Populate appointment_services with existing data from appointments.service_id
INSERT INTO appointment_services (appointment_id, service_id, created_at)
SELECT id, service_id, created_at
FROM appointments
WHERE service_id IS NOT NULL;

-- Verify migration
DO $$
DECLARE
  original_count INT;
  migrated_count INT;
BEGIN
  SELECT COUNT(*) INTO original_count FROM appointments WHERE service_id IS NOT NULL;
  SELECT COUNT(*) INTO migrated_count FROM appointment_services;
  
  IF original_count != migrated_count THEN
    RAISE EXCEPTION 'Migration failed: expected % records, got %', original_count, migrated_count;
  END IF;
  
  RAISE NOTICE 'Migration successful: % records migrated', migrated_count;
END $$;