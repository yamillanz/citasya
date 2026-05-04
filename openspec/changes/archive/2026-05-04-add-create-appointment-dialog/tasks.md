# Tasks: Create Appointment Dialog

## Phase 1: Create Dialog Component
- [x] 1.1 Create `appointment-create-dialog.component.ts` with standalone component, signal inputs/outputs, injected services, reactive form, and business logic (load services, calculate slots, submit)
- [x] 1.2 Create `appointment-create-dialog.component.html` with p-dialog, form fields, service checkboxes with scroll, date from calendar input, time select, footer buttons
- [x] 1.3 Create `appointment-create-dialog.component.scss` with service scroll container styles
- [x] 1.4 Create `appointment-create-dialog.component.spec.ts` with behavior-oriented tests

## Phase 2: Integrate into Calendar
- [x] 2.1 Add `showCreateDialog` signal and methods to `employee-calendar.component.ts`
- [x] 2.2 Add "Nueva Cita" button (dynamic label with selected date) and dialog tag to `employee-calendar.component.html`
- [x] 2.3 Add button styles to `employee-calendar.component.scss`
- [x] 2.4 Add integration tests to `employee-calendar.component.spec.ts`

## Phase 3: Global Styles & Verification
- [x] 3.1 Add p-dialog overrides to `styles.scss` if needed
- [x] 3.2 Run full test suite (538/538 passing) and fix failures
- [x] 3.3 Run build to verify compilation
