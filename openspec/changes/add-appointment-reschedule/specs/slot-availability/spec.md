## MODIFIED Requirements

### Requirement: Available slots calculation

The system SHALL calculate available time slots based on employee schedule, existing appointments, and service duration. An optional excluded appointment SHALL be ignored while computing busy intervals, so the appointment being rescheduled does not block its own slots.

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

#### Scenario: Excluded appointment does not block its own slots

- **GIVEN** an appointment at 10:00 lasting 30 minutes is being rescheduled
- **WHEN** availability is calculated for that employee and date with the appointment excluded
- **THEN** 10:00 and 10:30 are offered again (subject to other appointments)
- **AND** every other non-cancelled appointment still blocks its overlapping slots
