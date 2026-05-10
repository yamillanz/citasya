# Manager Walk-in Appointment - Proposal

## Intent
Enable managers to register walk-in client appointments for any available employee from the appointments listing page (`/bo/appointments`).

## Scope
- **In**: New `ManagerAppointmentCreateDialogComponent` with employee selector, service checkboxes, date picker, time slot grid, and client info. "Nueva Cita" button in appointments page header. Global dialog styles.
- **Out**: Modifying the employee calendar dialog. Backend changes. Other pages.

## Approach
New standalone dialog component mirroring the existing `AppointmentCreateDialogComponent` pattern, extended with employee dropdown and date picker. Triggered from appointments page header button.

## Files Changed
- `app-web/src/app/features/backoffice/manager/appointments/manager-appointment-create-dialog.component.ts` (new)
- `app-web/src/app/features/backoffice/manager/appointments/manager-appointment-create-dialog.component.html` (new)
- `app-web/src/app/features/backoffice/manager/appointments/manager-appointment-create-dialog.component.scss` (new)
- `app-web/src/app/features/backoffice/manager/appointments/manager-appointment-create-dialog.component.spec.ts` (new)
- `app-web/src/app/features/backoffice/manager/appointments/appointments.component.ts` (modified)
- `app-web/src/app/features/backoffice/manager/appointments/appointments.component.html` (modified)
- `app-web/src/app/features/backoffice/manager/appointments/appointments.component.scss` (modified)
- `app-web/src/styles.scss` (modified)

## Bug Fix Documented
- `openspec/specs/primeng-datepicker-onpush-bug/spec.md` — p-datepicker + formControlName + OnPush double-click bug, solution with signal + ngModel standalone