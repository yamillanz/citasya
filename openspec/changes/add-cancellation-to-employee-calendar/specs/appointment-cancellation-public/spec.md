# appointment-cancellation-public Specification

## Purpose
Enables authenticated employees and managers to cancel pending appointments from the public employee calendar view, with role verification and confirmation dialog.

## Requirements

### Requirement: Show pending appointments on employee calendar
The system SHALL load and display appointments with status `pending` as events on the FullCalendar in the public employee calendar page.

#### Scenario: Pending appointments visible on calendar
- **GIVEN** the employee has one or more appointments with status `pending`
- **WHEN** the public employee calendar page loads
- **THEN** each pending appointment appears as a yellow event (`#F4D03F`) on the calendar
- **AND** each event shows the format `"HH:MM - Client Name"`

#### Scenario: No pending appointments
- **GIVEN** the employee has no pending appointments
- **WHEN** the public employee calendar page loads
- **THEN** no appointment events are displayed on the calendar
- **AND** the calendar functions normally for date/time selection

#### Scenario: Cancelled appointments excluded
- **GIVEN** the employee has appointments with status `cancelled`
- **WHEN** the public employee calendar page loads
- **THEN** cancelled appointments are NOT displayed as events

### Requirement: Click appointment event opens detail dialog
The system SHALL open the `AppointmentDetailDialogComponent` when the user clicks on a pending appointment event in the calendar.

#### Scenario: Click on appointment event
- **GIVEN** pending appointments are visible on the calendar
- **WHEN** the user clicks on an appointment event
- **THEN** the `AppointmentDetailDialogComponent` opens with `[visible]="true"`
- **AND** displays the appointment details: client name, phone, email, date, time, services list, status badge, and total amount

#### Scenario: Dialog closes cleanly
- **GIVEN** the detail dialog is open
- **WHEN** the user clicks "Cerrar" or the dialog is dismissed
- **THEN** the dialog closes and `selectedAppointment` is reset to `null`

### Requirement: Cancel button visible only for authorized users
The system SHALL show a "Cancelar Cita" button in the appointment detail dialog footer only when ALL of the following conditions are met:
1. The user is authenticated (logged in)
2. The authenticated user is EITHER the employee themselves (`currentUser.id === employeeId`) OR a manager of the same company (`currentUser.role === 'manager' AND currentUser.company_id === company.id`)
3. The appointment status is `pending`
4. The dialog is NOT in service-editing mode

#### Scenario: Employee views own pending appointment
- **GIVEN** the employee is authenticated and viewing their own calendar
- **WHEN** they open the detail dialog for one of their pending appointments
- **THEN** the "Cancelar Cita" button is visible in the footer, positioned between "Editar Servicios" and "Cerrar"

#### Scenario: Manager views employee's pending appointment
- **GIVEN** a manager is authenticated and belongs to the same company as the employee
- **WHEN** they open the detail dialog for a pending appointment
- **THEN** the "Cancelar Cita" button is visible in the footer

#### Scenario: Unauthenticated user
- **GIVEN** the user is NOT logged in
- **WHEN** they open the detail dialog for a pending appointment
- **THEN** the "Cancelar Cita" button is NOT visible

#### Scenario: User from different company
- **GIVEN** an authenticated user belongs to a different company
- **WHEN** they open the detail dialog for a pending appointment
- **THEN** the "Cancelar Cita" button is NOT visible

#### Scenario: Appointment already cancelled or completed
- **GIVEN** an authorized user views an appointment with status `cancelled` or `completed`
- **WHEN** the detail dialog opens
- **THEN** the "Cancelar Cita" button is NOT visible

### Requirement: Cancel appointment with confirmation
The system SHALL require explicit confirmation before cancelling an appointment.

#### Scenario: Confirm cancellation
- **GIVEN** an authorized user clicks "Cancelar Cita" on a pending appointment
- **WHEN** the confirmation dialog appears with message "¿Cancelar esta cita?", header "Confirmar cancelación", accept label "Sí, cancelar", reject label "No"
- **AND** the user clicks "Sí, cancelar"
- **THEN** the appointment status is updated to `cancelled` in the database
- **AND** the `updated_at` timestamp is set to the current time
- **AND** a success toast is shown: "Cita cancelada correctamente"
- **AND** the calendar refreshes to remove the cancelled appointment

#### Scenario: Reject cancellation
- **GIVEN** an authorized user clicks "Cancelar Cita" on a pending appointment
- **WHEN** the confirmation dialog appears
- **AND** the user clicks "No" or dismisses the dialog
- **THEN** the appointment status remains unchanged
- **AND** no database update occurs

### Requirement: Calendar refreshes after cancellation
The system SHALL reload pending appointments and update the calendar events after a successful cancellation.

#### Scenario: Cancelled appointment removed from calendar
- **GIVEN** a pending appointment was just cancelled successfully
- **WHEN** the calendar data is refreshed
- **THEN** the cancelled appointment no longer appears as an event on the calendar

### Requirement: Toast notifications for cancellation results
The system SHALL display toast notifications for cancellation operation results.

#### Scenario: Success toast
- **WHEN** an appointment is cancelled successfully
- **THEN** a toast appears with severity `success`, summary "Éxito", detail "Cita cancelada correctamente"

#### Scenario: Error toast
- **WHEN** the cancellation fails (network error, permission error, etc.)
- **THEN** a toast appears with severity `error`, summary "Error", detail containing the error message

### Requirement: Cancel button visual feedback
The system SHALL provide visual feedback on the cancel button during the cancellation process.

#### Scenario: Loading state on cancel button
- **WHEN** the user confirms cancellation and the request is in progress
- **THEN** the "Cancelar Cita" button shows a loading spinner via PrimeNG's `[loading]` binding
- **AND** the button is disabled to prevent duplicate clicks

#### Scenario: Loading state ends
- **WHEN** the cancellation request completes (success or error)
- **THEN** the loading spinner stops and the button returns to its normal state

### Requirement: Non-breaking changes to existing dialog consumers
The system SHALL NOT break existing consumers of `AppointmentDetailDialogComponent` (employee history page, future consumers).

#### Scenario: Employee history page unaffected
- **GIVEN** the employee history page uses `AppointmentDetailDialogComponent`
- **WHEN** the dialog is opened from the history page
- **THEN** the "Cancelar Cita" button does NOT appear (because `canCancel` input defaults to `false`)
- **AND** all existing functionality (navigation, service editing) works unchanged
