# appointment-multi-service Specification

## Purpose
TBD - created by archiving change multiple-services-per-appointment. Update Purpose after archive.
## Requirements
### Requirement: Appointment can have multiple services

The system SHALL allow appointments to be associated with one or more services through a many-to-many relationship.

#### Scenario: Create appointment with multiple services
- **WHEN** a client creates an appointment selecting services ["Corte", "Barba", "Tratamiento"]
- **THEN** the system creates records in `appointment_services` linking the appointment to all three services

#### Scenario: Create appointment with single service
- **WHEN** a client creates an appointment selecting one service ["Corte"]
- **THEN** the system creates one record in `appointment_services` linking the appointment to that service

#### Scenario: Appointment must have at least one service
- **WHEN** a client attempts to create an appointment with no services selected
- **THEN** the system displays an error: "At least one service is required"
- **AND** the appointment is not created

### Requirement: Total duration calculation

The system SHALL calculate the total duration of an appointment as the sum of all selected service durations.

#### Scenario: Calculate duration for multiple services
- **WHEN** an appointment has services with durations [30 minutes, 20 minutes, 15 minutes]
- **THEN** the system calculates total duration as 65 minutes

#### Scenario: Use total duration for availability validation
- **WHEN** a client selects services totaling 65 minutes
- **THEN** the system validates availability for a 65-minute time slot
- **AND** returns available time slots that can accommodate 65 minutes

### Requirement: Total price calculation

The system SHALL calculate the total price of an appointment as the sum of all selected service prices.

#### Scenario: Calculate price for multiple services
- **WHEN** an appointment has services with prices [$20, $15, $10]
- **THEN** the system calculates total price as $45

#### Scenario: Handle services without price
- **WHEN** an appointment has services where some have no price defined
- **THEN** the system treats missing prices as $0
- **AND** calculates total price excluding those services

### Requirement: Services can be modified before appointment completion

The system SHALL allow employees and managers to add or remove services from an appointment while its status is `pending`.

#### Scenario: Add service to pending appointment
- **WHEN** an employee adds service "Tratamiento" to a pending appointment
- **THEN** the system creates a new record in `appointment_services`
- **AND** recalculates total duration and price

#### Scenario: Remove service from pending appointment
- **WHEN** an employee removes a service from a pending appointment
- **AND** the appointment still has at least one service remaining
- **THEN** the system deletes the record from `appointment_services`
- **AND** recalculates total duration and price

#### Scenario: Cannot remove last service
- **WHEN** an employee attempts to remove the last service from an appointment
- **THEN** the system displays an error: "At least one service is required"
- **AND** the service is not removed

#### Scenario: Cannot modify services on completed appointment
- **WHEN** an employee attempts to add or remove services from a completed appointment
- **THEN** the system displays an error: "Services can only be modified on pending appointments"
- **AND** no changes are made

#### Scenario: Cannot modify services on cancelled appointment
- **WHEN** an employee attempts to add or remove services from a cancelled appointment
- **THEN** the system displays an error: "Services can only be modified on pending appointments"
- **AND** no changes are made

### Requirement: Availability validation when modifying services

The system SHALL validate availability when services are added to an appointment, ensuring the new total duration does not conflict with other appointments.

#### Scenario: Add service that fits available time
- **WHEN** an employee adds a 15-minute service to an existing 30-minute appointment
- **AND** the time slot can accommodate 45 minutes total
- **THEN** the system allows the modification
- **AND** updates total duration to 45 minutes

#### Scenario: Add service that exceeds available time
- **WHEN** an employee attempts to add a service that would make total duration exceed available time
- **THEN** the system displays an error: "The selected services exceed available time"
- **AND** the service is not added

#### Scenario: Availability check excludes current appointment
- **WHEN** an employee modifies services on an existing appointment
- **AND** checks availability for the new total duration
- **THEN** the system excludes the current appointment from availability validation
- **AND** only considers other appointments for that time slot

### Requirement: Services display format

The system SHALL display multiple services in compact format with commas.

#### Scenario: Display multiple services in appointment list
- **WHEN** an appointment has services ["Corte", "Barba", "Tratamiento"]
- **THEN** the system displays as "Corte, Barba, Tratamiento"

#### Scenario: Display single service
- **WHEN** an appointment has one service ["Corte"]
- **THEN** the system displays as "Corte"

#### Scenario: Display services in detail view
- **WHEN** viewing appointment details
- **THEN** the system displays each service on a separate line with name, duration, and price

### Requirement: Database relationship structure

The system SHALL maintain a many-to-many relationship between appointments and services using an intermediate table.

#### Scenario: Appointment services table structure
- **WHEN** the system creates the database schema
- **THEN** it includes table `appointment_services` with:
  - `appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE`
  - `service_id UUID REFERENCES services(id) ON DELETE RESTRICT`
  - `created_at TIMESTAMPTZ DEFAULT NOW()`
  - `PRIMARY KEY (appointment_id, service_id)`

#### Scenario: Prevent duplicate services in same appointment
- **WHEN** attempting to add the same service twice to an appointment
- **THEN** the database constraint prevents the duplicate entry
- **AND** the system displays an error

#### Scenario: Cascade delete on appointment removal
- **WHEN** an appointment is deleted
- **THEN** all records in `appointment_services` for that appointment are automatically deleted

### Requirement: Row Level Security policies

The system SHALL implement RLS policies for the `appointment_services` table to ensure data security.

#### Scenario: Users can view services for their own appointments
- **WHEN** an employee queries appointment services
- **THEN** they can only see records for appointments where `employee_id` matches their user ID

#### Scenario: Public can insert services for new appointments
- **WHEN** a client creates a new appointment via booking form
- **THEN** the system allows inserting records into `appointment_services` for that appointment

#### Scenario: Users can delete services for their appointments
- **WHEN** an employee modifies services on their appointment
- **THEN** they can delete records from `appointment_services` for that appointment

