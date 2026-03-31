# Tasks: SharedCalendarComponent

## Create SharedCalendarComponent

- [x] Create `shared/components/calendar/` directory
- [x] Create `calendar.component.ts` with inputs/outputs
- [x] Create `calendar.component.html` with template
- [x] Create `calendar.component.scss` with styles
- [x] Create `calendar.component.spec.ts` with unit tests (25 tests passing)

## Refactor EmployeeCalendarComponent

- [x] Import and use SharedCalendarComponent in employee-calendar.component.ts
- [x] Remove calendar logic from employee component (keep dialog and data loading)
- [x] Update employee-calendar.component.html to use SharedCalendarComponent
- [x] Build verification passed

## Verification

- [x] Build compiles without errors
- [x] All 172 tests passing (25 new calendar tests + 147 existing)
- [ ] Test in browser: http://localhost:4200/emp/calendar
- [ ] Verify both views (month/week) work correctly
- [ ] Verify appointment details dialog still works
