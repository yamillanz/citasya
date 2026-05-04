# Specs: Create Appointment Dialog

## ADDED Requirements

### REQ-1: New Appointment Button
The employee calendar SHALL display a "Nueva Cita" button in the header actions, positioned before the refresh button.

### REQ-2: Dialog Trigger
Clicking "Nueva Cita" SHALL open the appointment creation dialog.

### REQ-3: Dialog Layout
The dialog SHALL use `p-dialog` with header "Nueva Cita", a form body, and footer with "Cancelar" and "Crear Cita" buttons.

### REQ-4: Employee Services Loading
When the dialog opens, it SHALL load the employee's assigned services via `ServiceService.getByEmployee(employeeId)`.
- **Scenario**: Services load successfully → all active services displayed as checkboxes.
- **Scenario**: Services load fails → error toast shown, dialog closes.

### REQ-5: Service Selection
The user SHALL select one or more services via checkboxes.
- **Scenario**: No services selected on submit → validation error shown.
- **Scenario**: Services selected → `service_ids` array updates in form.

### REQ-6: Service Scroll
When more than 4 services are available, the list SHALL show with fixed max-height and vertical scroll.

### REQ-7: Date Selection
The user SHALL select a date via `p-datepicker`, restricted to future dates only.
- **Scenario**: Datepicker open → past dates and today are disabled.

### REQ-8: Time Slot Calculation
When date and services are selected, the system SHALL fetch available slots via `AppointmentService.getAvailableSlots()`.
- **Scenario**: Date or services change → slots recalculated.
- **Scenario**: Slot loading fails → error shown in time field.

### REQ-9: Time Selection
The user SHALL select a time from the available slots dropdown.
- **Scenario**: No slots available → "No hay horarios disponibles" message.

### REQ-10: Client Name
The user SHALL enter a client name (required).

### REQ-11: Client Phone
The user MAY enter a phone number (optional).

### REQ-12: Client Email
The user MAY enter an email (optional, validated for format if provided).

### REQ-13: Form Validation
Submit button SHALL be disabled until required fields are valid.
- **Scenario**: Form incomplete → "Crear Cita" disabled.
- **Scenario**: Form complete → "Crear Cita" enabled.

### REQ-14: Appointment Creation
On submit, SHALL call `AppointmentService.create()` with correct DTO.
- **Scenario**: Valid form submitted → `create()` called with all fields.
- **Scenario**: Submitting → button shows loading, disabled.

### REQ-15: Success Handling
On success, SHALL emit `onCreated`, close dialog, show success toast.
- **Scenario**: Created → calendar refreshes.

### REQ-16: Error Handling
On failure, SHALL show error toast, keep dialog open.
- **Scenario**: Creation fails → error message shown.

### REQ-17: Dialog Close
"Cancelar" or backdrop click SHALL close dialog without creating.
- **Scenario**: User cancels → form resets, dialog closes.
