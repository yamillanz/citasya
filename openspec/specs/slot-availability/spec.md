# slot-availability Specification

## Purpose
TBD - created by archiving change phase-2-public-booking. Update Purpose after archive.
## Requirements
### Requirement: Available slots calculation
The system SHALL calculate available time slots based on employee schedule, existing appointments, and service duration.

#### Scenario: Calculate slots for working day
- **WHEN** calculating slots for a date within employee's working hours
- **THEN** system generates time slots at 30 or 60-minute intervals
- **AND** excludes times that overlap with existing appointments

#### Scenario: Exclude booked slots
- **WHEN** employee has an appointment at 10:00 for 30 minutes
- **THEN** system SHALL NOT include 10:00, 10:30, or any slot that overlaps with the existing appointment

#### Scenario: Respect service duration
- **WHEN** calculating available slots for a 60-minute service
- **THEN** system ensures each slot can accommodate the full service duration
- **AND** slots that would extend beyond working hours are excluded

### Requirement: Slot availability by employee schedule
The system SHALL respect the company's working schedule when calculating available slots.

#### Scenario: No slots outside working hours
- **WHEN** company working hours are 09:00-18:00
- **THEN** no slots are available before 09:00 or after 18:00

#### Scenario: Different hours per day
- **WHEN** company has different hours for different days
- **THEN** system calculates slots based on the specific day's schedule

