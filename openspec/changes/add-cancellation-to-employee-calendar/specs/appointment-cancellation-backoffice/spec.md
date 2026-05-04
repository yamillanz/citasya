# appointment-cancellation-backoffice Specification

## Purpose
Enables authenticated employees to cancel their pending appointments from the backoffice employee calendar (`/emp/calendar`), using the reusable appointment detail dialog with confirmation.

## Requirements

### Requirement: Show full appointment details on backoffice calendar
The system SHALL display the reusable `AppointmentDetailDialogComponent` when the employee clicks on an appointment event in their backoffice calendar.

#### Scenario: Click appointment opens rich detail dialog
- **GIVEN** the employee is authenticated and viewing their calendar at `/emp/calendar`
- **WHEN** they click on an appointment event
- **THEN** the `AppointmentDetailDialogComponent` opens showing: client name, phone, email, date, time, services list with duration and price, status badge, amount collected, and notes (if any)

#### Scenario: Dialog replaces old simple inline dialog
- **GIVEN** the backoffice employee calendar previously used a simple inline `p-dialog`
- **WHEN** the component renders
- **THEN** the simple inline dialog is completely replaced by the reusable `AppointmentDetailDialogComponent`
- **AND** the reusable dialog is the same component used in the employee history page

### Requirement: Cancel button visible for employee's own pending appointments
The system SHALL show a "Cancelar" button in the dialog footer when the employee views their own pending appointments.

#### Scenario: Cancel button visible for pending appointment
- **GIVEN** the authenticated employee clicks on a pending appointment in their calendar
- **WHEN** the detail dialog opens
- **THEN** a "Cancelar" button (danger, outlined) is visible in the footer, positioned between navigation buttons and the "Cerrar" button

#### Scenario: Cancel button NOT visible for non-pending appointments
- **GIVEN** the authenticated employee clicks on a completed, cancelled, or no-show appointment
- **WHEN** the detail dialog opens
- **THEN** the "Cancelar" button is NOT visible

### Requirement: Cancel appointment with confirmation
The system SHALL require explicit confirmation before cancelling an appointment.

#### Scenario: Confirm cancellation
- **GIVEN** the employee clicks "Cancelar" on a pending appointment
- **WHEN** the confirmation dialog appears with message "¿Cancelar esta cita?", header "Confirmar cancelación", accept label "Sí, cancelar", reject label "No"
- **AND** the employee clicks "Sí, cancelar"
- **THEN** the appointment status is updated to `cancelled` in the database
- **AND** a success toast is shown: "Cita cancelada correctamente"
- **AND** the calendar refreshes to reflect the cancelled appointment

#### Scenario: Reject cancellation
- **GIVEN** the employee clicks "Cancelar" on a pending appointment
- **WHEN** the confirmation dialog appears
- **AND** the employee clicks "No" or dismisses the dialog
- **THEN** the appointment status remains unchanged

### Requirement: Calendar refreshes after cancellation
The system SHALL reload appointments and update the calendar after a successful cancellation.

#### Scenario: Calendar updated after cancel
- **GIVEN** a pending appointment was just cancelled
- **WHEN** the calendar data is refreshed
- **THEN** the cancelled appointment reflects its new status on the calendar (appears with cancelled color/status)

### Requirement: Toast notifications for cancellation results
The system SHALL display toast notifications for cancellation results.

#### Scenario: Success toast
- **WHEN** an appointment is cancelled successfully
- **THEN** a toast appears with severity `success`, summary "Éxito", detail "Cita cancelada correctamente"

#### Scenario: Error toast
- **WHEN** the cancellation fails
- **THEN** a toast appears with severity `error`, summary "Error", detail containing the error message

### Requirement: No service editing in calendar context
The system SHALL NOT show the "Editar Servicios" button in the dialog when opened from the backoffice employee calendar.

#### Scenario: Edit services hidden
- **GIVEN** the dialog is opened from `/emp/calendar`
- **WHEN** the dialog renders
- **THEN** the "Editar Servicios" button is not visible (regardless of appointment status)

### Requirement: Non-breaking changes to existing dialog consumers
The system SHALL NOT break the `AppointmentDetailDialogComponent` when used from the employee history page.

#### Scenario: Employee history page unaffected
- **GIVEN** the employee history page uses `AppointmentDetailDialogComponent`
- **WHEN** opening the dialog from the history page
- **THEN** the "Cancelar" button does NOT appear (because `canCancel` defaults to `false`)
- **AND** the "Editar Servicios" button DOES appear for pending appointments (because `canEdit` defaults to `true`)
- **AND** all existing functionality (navigation, service editing) works unchanged
