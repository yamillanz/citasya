-- Set default 50% commission for all existing services
-- This sets the commission for services that already exist in the system
UPDATE services
SET commission_percentage = 50.00
WHERE commission_percentage = 0;