# Tasks: Create Appointment Dialog

## Phase 1: Create Dialog Component
- [ ] 1.1 Create `appointment-create-dialog.component.ts` with standalone component, signal inputs/outputs, injected services, reactive form, and business logic (load services, calculate slots, submit)
- [ ] 1.2 Create `appointment-create-dialog.component.html` with p-dialog, form fields, service checkboxes with scroll, datepicker, time select, footer buttons
- [ ] 1.3 Create `appointment-create-dialog.component.scss` with service scroll container styles
- [ ] 1.4 Create `appointment-create-dialog.component.spec.ts` with behavior-oriented tests

## Phase 2: Integrate into Calendar
- [ ] 2.1 Add `showCreateDialog` signal and methods to `employee-calendar.component.ts`
- [ ] 2.2 Add "Nueva Cita" button and dialog tag to `employee-calendar.component.html`
- [ ] 2.3 Add button styles to `employee-calendar.component.scss`
- [ ] 2.4 Add integration tests to `employee-calendar.component.spec.ts`

## Phase 3: Global Styles & Verification
- [ ] 3.1 Add p-dialog overrides to `styles.scss` if needed
- [ ] 3.2 Run full test suite (`npx ng test --no-coverage`) and fix failures
- [ ] 3.3 Run build (`npx ng build --configuration development`) to verify compilation
