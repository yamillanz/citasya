## Why

Employees using the backoffice employee calendar (`/emp/calendar`) had no way to cancel pending appointments from within their own calendar view. The existing appointment detail dialog (a simple inline `p-dialog`) only showed basic info (date, time, client, status) with a single "Cerrar" button. Employees had to navigate to a different view (daily close) to cancel appointments, disrupting their workflow.

## What Changes

- Replace the simple inline `p-dialog` in the **backoffice employee calendar** with the reusable `AppointmentDetailDialogComponent` already used in the employee history page
- The reusable dialog now shows full appointment details (client info, services, duration, price, status, amount, notes)
- Add a "Cancelar" button to the dialog footer, visible when the appointment status is `pending` (the employee is always authorized since they own the calendar)
- The cancel button shows a PrimeNG confirmation dialog before proceeding
- On confirmation, calls `appointmentService.cancel(id)`, refreshes the calendar, and shows a success toast
- The `AppointmentDetailDialogComponent` is extended with `canCancel` input, `canEdit` input (to optionally hide service editing), and `onCancelAppointment` output — all opt-in, no breaking changes to existing consumers

## Capabilities

### New Capabilities
- `appointment-cancellation-backoffice`: Allows authenticated employees to cancel their own pending appointments from the backoffice employee calendar (`/emp/calendar`), with confirmation dialog and full appointment detail display.

### Modified Capabilities
- `appointment-detail-dialog`: Extended with `canCancel` input, `canEdit` input, `onCancelAppointment` output, and cancel button in footer (all opt-in, defaults preserve existing behavior)

## Impact

- **Components modified**:
  - `app-web/src/app/features/backoffice/employee/calendar/employee-calendar.component.ts` — replace inline dialog with `AppointmentDetailDialogComponent`, add cancel handler
  - `app-web/src/app/features/backoffice/employee/calendar/employee-calendar.component.html` — replace inline `p-dialog` with `<app-appointment-detail-dialog>`, add `<p-toast>`
  - `app-web/src/app/features/backoffice/employee/history/appointment-detail-dialog.component.ts` — add `canCancel`, `canEdit` inputs and `onCancelAppointment` output
  - `app-web/src/app/features/backoffice/employee/history/appointment-detail-dialog.component.html` — add "Cancelar" button in footer
- **No API changes**: Reuses existing `appointmentService.cancel()` and `getByEmployeeAll()`
- **No new dependencies**: Uses already-provided `ConfirmationService`, `ConfirmDialogModule`, `ToastModule`
- **No breaking changes**: `AppointmentDetailDialogComponent` changes are purely additive (new optional inputs/outputs with safe defaults)
