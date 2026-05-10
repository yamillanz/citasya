# Manager Walk-in Appointment - Tasks

## Implementation Tasks

- [x] Create `manager-appointment-create-dialog.component.ts` with signal-based state management, form controls, and template event handlers
- [x] Create `manager-appointment-create-dialog.component.html` with employee selector, service checkboxes, date picker (signal+ngModel), time slot grid, and client info fields
- [x] Create `manager-appointment-create-dialog.component.scss` matching existing dialog styles
- [x] Create `manager-appointment-create-dialog.component.spec.ts` with 53 tests covering behavior and edge cases
- [x] Update `appointments.component.ts` — add dialog integration, OnPush change detection, showCreateDialog signal, openCreateDialog and handleAppointmentCreated methods
- [x] Update `appointments.component.html` — add "Nueva Cita" button in header, add dialog component element
- [x] Update `appointments.component.scss` — add header-actions and btn-new-appointment styles
- [x] Update `styles.scss` — add .manager-create-appointment-dialog global overrides
- [x] Document p-datepicker + OnPush bug in `openspec/specs/primeng-datepicker-onpush-bug/spec.md`
- [x] Add bug workaround reference in `AGENTS.md`
- [x] Build passes with no errors/warnings
- [x] All 659 tests pass (including 53 new tests)