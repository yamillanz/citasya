# Proposal: Add Create Appointment Dialog to Employee Calendar

## Intent
Add a "Nueva Cita" button and creation dialog to the backoffice employee calendar (`/emp/calendar`) allowing employees to create new appointments in their own calendar directly from the calendar view.

## Scope

### In
- New `AppointmentCreateDialogComponent` — standalone dialog with reactive form for appointment creation
- "Nueva Cita" button in the employee calendar header (before refresh button)
- Integration with `AppointmentService.create()` and `getAvailableSlots()`
- Loading of employee services via `ServiceService.getByEmployee()`
- Conditional scroll on service checkboxes (> 4 services)
- Date restriction: future dates only (tomorrow onwards)
- Time selection from available slots (dynamically calculated from date + service duration)
- Toast notifications for success/error
- Behavior-oriented unit tests

### Out
- No changes to public calendar
- No changes to manager/superadmin panels
- No changes to existing `AppointmentDetailDialogComponent`

## Approach
Create new standalone component `AppointmentCreateDialogComponent` following same patterns as `AppointmentDetailDialogComponent` (PrimeNG p-dialog, reactive forms, signals, OnPush). Dialog accepts `employeeId` and `companyId` as inputs, loads services and available slots internally, emits `onCreated` on success. Parent `EmployeeCalendarComponent` manages dialog visibility.
