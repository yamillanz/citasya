# Manager Walk-in Appointment - Delta Specs

## ADDED Requirements

### REQ-MWA-001: Manager Walk-in Appointment Creation
The system SHALL allow managers to create appointments for any employee from the appointments listing page.
- Scenario: Given a manager on `/bo/appointments`, When they click "Nueva Cita", Then a dialog opens with employee selector, services, client info, date, and time fields
- Scenario: Given the dialog is open, When the manager selects an employee, Then services for that employee load dynamically via `ServiceService.getByEmployee()`
- Scenario: Given an employee is selected and services are checked, When the manager selects a date, Then available time slots load for that employee on that date
- Scenario: Given all required fields are filled, When the manager clicks "Crear Cita", Then the appointment is created and the list refreshes

### REQ-MWA-002: Employee Selector
The dialog SHALL display a dropdown of all active employees (role=employee OR role=manager with can_be_employee=true). Selecting an employee is required before services and time slots load.
- Scenario: Given the dialog opens, When no employee is selected, Then services and time slots show placeholder messages

### REQ-MWA-003: Dynamic Service Loading
The dialog SHALL load services based on the selected employee. Changing employee resets services, service selections, and time slots.
- Scenario: Given employee A has 3 services and employee B has 5, When the manager switches from A to B, Then the service list updates and previous selections are cleared

### REQ-MWA-004: Time Slot Grid
The dialog SHALL display available time slots as a clickable button grid (NOT p-select), avoiding dropdown positioning issues inside p-dialog with scroll.
- Scenario: Given slots are loaded, When the manager clicks a time slot button, Then that slot is visually selected and the form value updates

### REQ-MWA-005: DatePicker Bug Workaround
The dialog SHALL use a signal (`selectedDate`) + `ngModel` with `{standalone: true}` instead of `formControlName` for the date picker, due to the PrimeNG p-datepicker + OnPush double-click bug.
- Scenario: Given the manager clicks a date, When the date is selected via `(onSelect)`, Then `selectedDate` signal updates immediately on the first click

### REQ-MWA-006: Appointments Page Integration
The appointments listing page SHALL show a "Nueva Cita" button in the header next to the refresh button, styled as a primary action button.

### REQ-MWA-007: Employee Filter Update
The employees loaded by the appointments page SHALL include managers with `can_be_employee=true`, not just role=employee.

### REQ-MWA-008: Dialog Styling
The dialog SHALL use `styleClass="manager-create-appointment-dialog"` with global overrides in `styles.scss` matching the existing dialog pattern (linen header, warm-white content, border footer).