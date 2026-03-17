## ADDED Requirements

### Requirement: Employee calendar displays available services
The system SHALL display the employee's available services that they can perform.

#### Scenario: Services displayed after loading
- **WHEN** employee calendar page loads successfully
- **THEN** system displays list of services offered by the employee
- **AND** each service shows name, duration in minutes, and price

#### Scenario: No services available
- **WHEN** employee has no active services assigned
- **THEN** system displays message "No hay servicios disponibles"

### Requirement: FullCalendar integration for date selection
The system SHALL use FullCalendar to display an interactive calendar for date selection.

#### Scenario: Calendar renders with week view
- **WHEN** employee calendar page loads
- **THEN** FullCalendar displays in timeGridWeek view
- **AND** slot times range from 08:00 to 20:00
- **AND** weekends are visible

#### Scenario: User selects a date
- **WHEN** user clicks on a date in the calendar
- **THEN** system captures the selected date
- **AND** system loads available time slots for that date

### Requirement: Time slot selection
The system SHALL display available time slots for the selected date and allow user to select one.

#### Scenario: Available slots displayed
- **WHEN** user selects a date and service
- **THEN** system displays grid of available time slots
- **AND** user can click to select a time slot

#### Scenario: No slots available
- **WHEN** selected date has no available slots
- **THEN** system displays "No hay horarios disponibles para esta fecha"

### Requirement: Proceed to booking
The system SHALL allow user to proceed to booking form after selecting service, date, and time.

#### Scenario: Booking button enabled
- **WHEN** user has selected service, date, and time
- **THEN** "Continuar con la reserva" button is enabled
- **AND** clicking navigates to booking form with query params
