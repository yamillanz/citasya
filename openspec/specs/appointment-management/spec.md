# appointment-management Specification

## Purpose
TBD - created by archiving change multiple-services-per-appointment. Update Purpose after archive.
## Requirements
### Requirement: Display multiple services in appointment history

The appointment management system SHALL display all services for each appointment in a compact format.

#### Scenario: Display services in employee history
- **WHEN** an employee views their appointment history
- **THEN** each appointment shows all services as comma-separated text
- **AND** total duration and total price are displayed

#### Scenario: Display services in manager appointment list
- **WHEN** a manager views the appointments list
- **THEN** each appointment shows all services as comma-separated text
- **AND** total duration and total price are displayed

#### Scenario: Display services in appointment detail
- **WHEN** viewing appointment details
- **THEN** all services are displayed in a list format with:
  - Service name
  - Duration
  - Price (if available)

#### Scenario: Handle multiple services in table
- **WHEN** displaying appointments in a p-table component
- **THEN** services are shown in a single column as comma-separated text
- **AND** column width adjusts to content

### Requirement: Edit services on pending appointments

The appointment management system SHALL allow employees and managers to edit services on pending appointments.

#### Scenario: Manager opens appointment detail
- **WHEN** a manager clicks on an appointment in the list
- **THEN** the system opens a detail dialog showing all services
- **AND** if status is `pending`, displays an "Edit services" button

#### Scenario: Employee opens appointment detail
- **WHEN** an employee clicks on an appointment in their history
- **THEN** the system opens a detail dialog showing all services
- **AND** if status is `pending`, displays an "Edit services" button

#### Scenario: Enter edit mode
- **WHEN** user clicks "Edit services" button
- **THEN** the system displays all available services as checkboxes
- **AND** current services are pre-selected

#### Scenario: Add service in edit mode
- **WHEN** user selects an additional service
- **AND** total duration fits available time
- **THEN** the service is added to selection
- **AND** total duration and price update

#### Scenario: Remove service in edit mode
- **WHEN** user deselects a service
- **AND** at least one service remains selected
- **THEN** the service is removed from selection
- **AND** total duration and price update

#### Scenario: Attempt to remove last service
- **WHEN** user deselects all services
- **THEN** the system prevents deselecting the last service
- **AND** displays warning: "At least one service required"

#### Scenario: Save edited services
- **WHEN** user clicks "Save" button after modifying services
- **AND** availability validation passes
- **THEN** the system updates `appointment_services` table
- **AND** recalculates total duration and price
- **AND** displays success message

#### Scenario: Cancel edit
- **WHEN** user clicks "Cancel" button
- **THEN** the system discards changes
- **AND** restores original service selection

### Requirement: Availability validation on service edit

The system SHALL validate time availability when services are added to a pending appointment.

#### Scenario: Add service within available time
- **WHEN** user adds a service
- **AND** the new total duration fits the available time slot
- **THEN** the system allows the addition
- **AND** updates the appointment

#### Scenario: Add service exceeding available time
- **WHEN** user attempts to add a service
- **AND** the new total duration would exceed available time
- **THEN** the system displays error: "Selected services exceed available time"
- **AND** prevents the save operation

#### Scenario: Availability considers other appointments
- **WHEN** validating availability for edited services
- **THEN** the system considers all other appointments for that employee on that day
- **AND** excludes the current appointment from validation

#### Scenario: Real-time availability feedback
- **WHEN** user modifies service selection in edit mode
- **THEN** the system displays a warning if total duration exceeds available time
- **AND** disables the "Save" button

### Requirement: Cannot edit services on completed appointments

The system SHALL prevent service edits on appointments with status `completed`, `cancelled`, or `no_show`.

#### Scenario: Attempt to edit completed appointment
- **WHEN** user views a completed appointment
- **THEN** the "Edit services" button is not displayed
- **OR** displays as disabled

#### Scenario: Attempt to edit cancelled appointment
- **WHEN** user views a cancelled appointment
- **THEN** the "Edit services" button is not displayed
- **OR** displays as disabled

#### Scenario: Attempt to edit no-show appointment
- **WHEN** user views a no-show appointment
- **THEN** the "Edit services" button is not displayed
- **OR** displays as disabled

### Requirement: Service selection interface in edit mode

The edit services interface SHALL display available services with selection controls.

#### Scenario: Display available services
- **WHEN** entering edit mode
- **THEN** the system displays all services offered by the employee
- **AND** each service shows name, duration, and price

#### Scenario: Pre-select current services
- **WHEN** entering edit mode
- **THEN** services currently on the appointment are checked
- **AND** other services are unchecked

#### Scenario: Display running totals
- **WHEN** in edit mode
- **THEN** the system displays:
  - Total duration of selected services
  - Total price of selected services
  - Number of services selected

#### Scenario: Display service details
- **WHEN** reviewing services in edit mode
- **THEN** each service shows:
  - Name
  - Duration (in minutes)
  - Price (if available)

### Requirement: Audit trail for service modifications

The system SHALL maintain a record of service modifications on appointments.

#### Scenario: Track service additions
- **WHEN** a service is added to an appointment
- **THEN** the system creates a record in `appointment_services` with `created_at` timestamp

#### Scenario: Track service removals
- **WHEN** a service is removed from an appointment
- **THEN** the system deletes the record from `appointment_services`

#### Scenario: Preserve creation timestamp
- **WHEN** services are modified
- **THEN** the `created_at` field in `appointment_services` records when each service was added

### Requirement: Error handling for service operations

The system SHALL display clear error messages for service modification failures.

#### Scenario: Error adding duplicate service
- **WHEN** attempting to add the same service twice
- **THEN** the system displays error: "Service already added to appointment"

#### Scenario: Error saving due to availability
- **WHEN** save operation fails due to availability conflict
- **THEN** the system displays error: "Time slot no longer available"
- **AND** suggests alternative time slots

#### Scenario: Error due to concurrent modification
- **WHEN** two users attempt to modify same appointment simultaneously
- **THEN** the system displays error: "Appointment was modified by another user"
- **AND** prompts to refresh and try again

#### Scenario: Error due to network failure
- **WHEN** save operation fails due to network error
- **THEN** the system displays error: "Unable to save changes. Please try again."
- **AND** preserves user's selections for retry

### Requirement: Responsive service display

The appointment management interface SHALL display services appropriately on different screen sizes.

#### Scenario: Display on mobile devices
- **WHEN** viewing appointments on mobile
- **THEN** services are displayed as comma-separated text
- **AND** text wraps to next line if needed

#### Scenario: Display on desktop
- **WHEN** viewing appointments on desktop
- **THEN** services are displayed in a column with adequate width
- **AND** total duration and price are visible

#### Scenario: Display in export/PDF
- **WHEN** exporting appointments to PDF or PDF
- **THEN** services are displayed as comma-separated text
- **AND** total duration and price are included

### Requirement: Aggregate appointment queries by employee

The appointment service SHALL support querying appointments grouped by employee for a given date range and company.

#### Scenario: Fetch employee summary for date range
- **GIVEN** a company has appointments within a date range
- **WHEN** the system calls `getWeeklySummary(companyId, startDate, endDate)`
- **THEN** each row contains: employee_id, employee_name, total_appointments (completed only), total_amount, total_commission

#### Scenario: Fetch employee appointment detail
- **GIVEN** an employee has appointments within a date range
- **WHEN** the system calls `getEmployeeDetail(companyId, employeeId, startDate, endDate)`
- **THEN** all appointments for that employee in the range are returned (all statuses)
- **AND** each appointment includes its services with commission_percentage

#### Scenario: Commission calculation per appointment
- **GIVEN** an appointment with multiple services and an `amount_collected`
- **WHEN** calculating the commission
- **THEN** for each service, multiply the proportional amount by the service's commission_percentage
- **AND** sum all service commissions for the total appointment commission

