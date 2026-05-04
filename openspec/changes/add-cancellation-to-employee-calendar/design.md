# Design: add-cancellation-to-employee-calendar

## Architecture Decisions

### Decision: Replace inline p-dialog with reusable AppointmentDetailDialogComponent
**Chose** to replace the simple inline `p-dialog` in the backoffice employee calendar with the existing `AppointmentDetailDialogComponent`.
**Over** Adding cancel functionality to the inline dialog.
**Because**: The reusable component already handles appointment detail display, service listing, status badges, and formatting. Extending it with opt-in cancel/edit support via inputs/outputs is less code and more consistent than building a parallel implementation in the inline dialog.

### Decision: Add canCancel and canEdit inputs to the dialog
**Chose** to add `canCancel` (default `false`) and `canEdit` (default `true`) inputs.
**Over** Hardcoding the backoffice context logic in the dialog.
**Because**: The dialog is used in different contexts (employee history, employee calendar). The inputs allow each consumer to control which features are enabled. The backoffice calendar passes `[canCancel]="true"` (employee is always authorized) and `[canEdit]="false"` (service editing is not needed in calendar view). The employee history page doesn't pass these inputs, so they default to `false`/`true` respectively — preserving existing behavior.

### Decision: Cancel logic lives in the parent, not the dialog
**Chose** to have the dialog emit `onCancelAppointment` and let the parent handle confirmation + service call.
**Over** Putting confirmation logic inside `AppointmentDetailDialogComponent`.
**Because**: Keeps the dialog reusable and focused on display. The parent controls the full flow: auth check (implicit — the employee is already authenticated), confirmation, service call, and data refresh.

### Decision: Use ConfirmationService directly for confirmation
**Chose** to inject `ConfirmationService` in the backoffice calendar component.
**Over** Using the `CONFIRMATION_DIALOG` injection token.
**Because**: `ConfirmationService` is already provided globally and `ConfirmDialogModule` is imported in `App`. Simple and consistent with the daily-close pattern.

### Decision: Type handling between AppointmentWithService and Appointment
**Chose** to cast `Appointment` to `AppointmentWithService` for the calendar input, and cast back for the dialog.
**Over** Changing the shared calendar component's input type.
**Because**: At runtime, `getByEmployeeAll` returns data with `services` array embedded. The cast `as unknown as Appointment` preserves runtime data while satisfying TypeScript. This avoids touching the shared calendar component which is used in multiple places.

## Data Flow

### Appointment Detail Flow
```
1. Employee clicks appointment event on calendar
2.   └── SharedCalendarComponent.handleEventClick()
3.         └── appointmentClicked.emit(appointment)
4.               └── EmployeeCalendarComponent.onAppointmentClick(apt)
5.                     ├── selectedAppointment.set(apt as Appointment)
6.                     └── showDetailsDialog.set(true)

7. AppointmentDetailDialogComponent renders:
8.   ├── Client info card
9.   ├── Appointment info card (date, time, services, duration, price, status)
10.  ├── Notes card (if present)
11.  └── Footer: [Navigation] [Cancelar] [Cerrar]
```

### Cancellation Flow
```
1. Employee clicks "Cancelar" in dialog
2.   └── onCancelAppointment.emit()
3.         └── EmployeeCalendarComponent.handleCancelAppointment()
4.               ├── confirmationService.confirm({...})
5.               ├── [If confirmed]
6.               │     ├── appointmentService.cancel(apt.id)
7.               │     ├── toast: success
8.               │     ├── loadAppointments()  // refresh
9.               │     └── closeDetailsDialog()
10.              └── [If rejected] → no-op
```

## File Changes

### Modified Files

| File | Change |
|------|--------|
| `app-web/src/app/features/backoffice/employee/calendar/employee-calendar.component.ts` | Remove inline dialog methods, import `AppointmentDetailDialogComponent`/`ConfirmationService`/`ToastModule`, add `handleCancelAppointment`/`closeDetailsDialog`, change `appointments` type to `Appointment[]` |
| `app-web/src/app/features/backoffice/employee/calendar/employee-calendar.component.html` | Replace inline `p-dialog` (67 lines) with `<app-appointment-detail-dialog>` (7 lines) + `<p-toast>` |
| `app-web/src/app/features/backoffice/employee/history/appointment-detail-dialog.component.ts` | Add `canCancel` input, `canEdit` input, `onCancelAppointment` output, update `canEditServices` computed |
| `app-web/src/app/features/backoffice/employee/history/appointment-detail-dialog.component.html` | Add "Cancelar" button in footer (after "Editar Servicios", before "Cerrar") |

### No New Files
All changes are modifications to existing files.
