## Why

Employees and managers currently have no way to cancel a pending appointment from the public employee calendar view. If a client cancels by phone or in person, the employee/manager must navigate to the backoffice daily-close workbench to cancel it. Adding cancellation directly to the employee calendar streamlines the workflow, allowing authenticated users (the employee themselves or a manager of the company) to cancel pending appointments in one click from the same calendar they use for booking.

## What Changes

- Load and display **pending** appointments as events on the FullCalendar in the public employee calendar page (`/c/:companySlug/e/:employeeId`)
- Clicking a pending appointment event opens the existing `AppointmentDetailDialogComponent` with the appointment details
- Add a "Cancelar Cita" button to the dialog footer, visible only when the user is authenticated AND is the employee or a manager of the same company
- The cancel button shows a PrimeNG confirmation dialog before proceeding
- On confirmation, calls `appointmentService.cancel(id)`, refreshes the calendar, and shows a success toast
- The `AppointmentDetailDialogComponent` is extended with a new `canCancel` input and `onCancelAppointment` output (no breaking changes to existing consumers)

## Capabilities

### New Capabilities
- `appointment-cancellation-public`: Allows authenticated employees and managers to cancel pending appointments from the public employee calendar, with role verification and confirmation dialog.

### Modified Capabilities
- `appointment-detail-dialog`: Extended with cancel button support (opt-in via `canCancel` input)
- `employee-calendar`: Now shows pending appointments as calendar events and integrates the detail dialog for viewing and cancelling

## Impact

- **Components modified**:
  - `app-web/src/app/features/backoffice/employee/history/appointment-detail-dialog.component.ts` — add `canCancel` input, `onCancelAppointment` output, `cancellingAppointment` signal
  - `app-web/src/app/features/backoffice/employee/history/appointment-detail-dialog.component.html` — add "Cancelar Cita" button in footer
  - `app-web/src/app/features/public/employee-calendar/employee-calendar.component.ts` — load pending appointments, integrate dialog, handle cancellation, convert calendarOptions to computed()
  - `app-web/src/app/features/public/employee-calendar/employee-calendar.component.html` — add dialog and toast components
- **No API changes**: Reuses existing `appointmentService.cancel()` and `getByEmployeeAll()`
- **No new dependencies**: Uses already-provided `ConfirmationService`, `ConfirmDialogModule`, `ToastModule`
- **No breaking changes**: `AppointmentDetailDialogComponent` changes are purely additive (new optional input/output)
