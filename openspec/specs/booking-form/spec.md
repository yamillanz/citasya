# booking-form Specification

## Purpose
TBD - created by archiving change multiple-services-per-appointment. Update Purpose after archive.
## Requirements
### Requirement: Multi-service selection interface

The booking form SHALL allow clients to select one or more services using checkboxes.

#### Scenario: Select multiple services
- **WHEN** a client views the service selection screen
- **THEN** the system displays all available services as checkboxes
- **AND** allows selecting multiple services simultaneously

#### Scenario: Select single service
- **WHEN** a client selects only one service
- **THEN** the system allows proceeding with the booking

#### Scenario: Deselect services
- **WHEN** a client deselects services
- **AND** at least one service remains selected
- **THEN** the system updates the selection summary

#### Scenario: Cannot deselect all services
- **WHEN** a client deselects all services
- **THEN** the system displays error: "At least one service must be selected"
- **AND** prevents proceeding to next step

### Requirement: Real-time total duration display

The booking form SHALL display the total duration of selected services in real-time.

#### Scenario: Display duration for single service
- **WHEN** a client selects one service with 30 minutes duration
- **THEN** the system displays "30 minutes"

#### Scenario: Display total duration for multiple services
- **WHEN** a client selects services with durations [30 min, 20 min, 15 min]
- **THEN** the system displays "65 minutes"

#### Scenario: Update duration on selection change
- **WHEN** a client adds or removes a service
- **THEN** the total duration updates immediately without page reload

### Requirement: Real-time total price display

The booking form SHALL display the total price of selected services in real-time.

#### Scenario: Display price for single service
- **WHEN** a client selects one service with $20 price
- **THEN** the system displays "$20"

#### Scenario: Display total price for multiple services
- **WHEN** a client selects services with prices [$20, $15, $10]
- **THEN** the system displays "$45"

#### Scenario: Handle services without price
- **WHEN** a client selects services where some have no price defined
- **THEN** the system displays price for services with defined prices
- **AND** treats services without price as $0 in total calculation

#### Scenario: Update price on selection change
- **WHEN** a client adds or removes a service
- **THEN** the total price updates immediately without page reload

### Requirement: Availability validation with total duration

The booking form SHALL validate time slot availability based on the total duration of selected services.

#### Scenario: Show available time slots for single service
- **WHEN** a client selects a 30-minute service
- **AND** views available time slots
- **THEN** the system displays time slots with at least 30 minutes availability

#### Scenario: Show available time slots for multiple services
- **WHEN** a client selects services totaling 65 minutes
- **AND** views available time slots
- **THEN** the system displays time slots with at least 65 minutes availability

#### Scenario: Filter time slots by total duration
- **WHEN** a client modifies service selection
- **AND** the total duration changes from 30 to 65 minutes
- **THEN** the system filters time slots to show only those accommodating 65 minutes

#### Scenario: No available slots for long duration
- **WHEN** a client selects services totaling 120 minutes
- **AND** the employee has no 2-hour slots available
- **THEN** the system displays "No available time slots for selected duration"

### Requirement: Services selection validation

The booking form SHALL prevent proceeding without selecting at least one service.

#### Scenario: Proceed button disabled with no services
- **WHEN** no services are selected
- **THEN** the system disables the proceed button

#### Scenario: Proceed button enabled with services
- **WHEN** at least one service is selected
- **THEN** the system enables the proceed button

### Requirement: Service selection summary

The booking form SHALL display a summary of selected services before confirmation.

#### Scenario: Display services summary
- **WHEN** a client has selected services
- **THEN** the system displays a summary showing:
  - List of all selected services with name and price
  - Total duration
  - Total price

#### Scenario: Summary updates on changes
- **WHEN** a client modifies service selection
- **THEN** the summary updates to reflect current selection

### Requirement: Navigation with service IDs

The booking form SHALL pass selected service IDs to the confirmation page.

#### Scenario: Pass services via query params
- **WHEN** a client navigates from calendar to booking form
- **THEN** the system includes `serviceIds=a,b,c` in query parameters

#### Scenario: Load services from query params
- **WHEN** the booking form receives `serviceIds` query parameter
- **THEN** the system loads and displays those services

#### Scenario: Load services from selection
- **WHEN** the booking form is accessed directly without query params
- **THEN** the system prompts for service selection

### Requirement: Services display in confirmation

The booking confirmation page SHALL display all selected services.

#### Scenario: Display all selected services
- **WHEN** a client views the confirmation page
- **THEN** the system displays all selected services in the summary

#### Scenario: Display total duration and price
- **WHEN** a client views the confirmation page
- **THEN** the system displays:
  - List of services with individual duration and price
  - Total duration
  - Total price

### Requirement: Create appointment with multiple services

The booking form SHALL create appointments with multiple services in a single transaction.

#### Scenario: Submit booking with multiple services
- **WHEN** a client submits the booking form
- **THEN** the system creates:
  - One appointment record
  - Multiple `appointment_services` records (one per service)

#### Scenario: Transaction rollback on failure
- **WHEN** the booking creation fails after creating appointment
- **THEN** the system rolls back all `appointment_services` inserts
- **AND** displays error message to client

#### Scenario: Send confirmation with service list
- **WHEN** the booking is successful
- **THEN** the confirmation message includes the list of all services

