## 1. Phase 1 - Create Core Services and Interfaces

- [ ] 1.1 Create `IConfirmationDialog` interface in `src/app/core/interfaces/confirmation-dialog.interface.ts`
- [ ] 1.2 Create `ConfirmConfig` interface with all required properties
- [ ] 1.3 Create `PrimeNGConfirmationDialog` implementation using PrimeNG ConfirmDialog service
- [ ] 1.4 Create `DailyCloseFacade` service with signal-based state in `src/app/core/services/daily-close.facade.ts`
- [ ] 1.5 Add `appointments` signal with loading from API
- [ ] 1.6 Add `loading`, `error`, and `canCloseDay` computed signals
- [ ] 1.7 Implement `loadAppointments(date)` method
- [ ] 1.8 Implement `changeStatus(appointmentId, status)` with optimistic updates
- [ ] 1.9 Implement `closeDay(date)` method
- [ ] 1.10 Create `AppointmentActionService` with Command pattern in `src/app/core/services/appointment-action.service.ts`
- [ ] 1.11 Create `Command` interface with execute() and optional undo()
- [ ] 1.12 Create `StatusChangeCommand` class implementing Command
- [ ] 1.13 Create `CloseDayCommand` class implementing Command
- [ ] 1.14 Add `createStatusChangeCommand()` factory method
- [ ] 1.15 Add `createCloseDayCommand()` factory method

## 2. Phase 2 - Create Test Infrastructure

- [ ] 2.1 Create `MockConfirmationDialog` class in `src/app/core/testing/mock-confirmation-dialog.service.ts`
- [ ] 2.2 Add configurable response (resolve true/false)
- [ ] 2.3 Add call tracking for test assertions
- [ ] 2.4 Create mock data generators for appointments
- [ ] 2.5 Create `MockAppointmentService` for API mocking
- [ ] 2.6 Set up TestBed helper utilities for component tests

## 3. Phase 3 - Refactor DailyCloseComponent

- [ ] 3.1 Inject `DailyCloseFacade` into component
- [ ] 3.2 Inject `IConfirmationDialog` into component
- [ ] 3.3 Replace local state with facade signals
- [ ] 3.4 Update `ngOnInit()` to call `facade.loadAppointments()`
- [ ] 3.5 Refactor `onChangeStatus()` to use dialog and facade
- [ ] 3.6 Refactor `onCloseDay()` to use dialog and facade
- [ ] 3.7 Remove all direct API calls from component
- [ ] 3.8 Remove business logic from component
- [ ] 3.9 Update template bindings to use facade signals
- [ ] 3.10 Verify component API (inputs/outputs) remains unchanged
- [ ] 3.11 Update component imports to include new services

## 4. Phase 4 - Write Comprehensive Tests

- [ ] 4.1 Write unit tests for `PrimeNGConfirmationDialog`
- [ ] 4.2 Write unit tests for `DailyCloseFacade` - initialization
- [ ] 4.3 Write unit tests for `DailyCloseFacade` - loadAppointments success path
- [ ] 4.4 Write unit tests for `DailyCloseFacade` - loadAppointments error path
- [ ] 4.5 Write unit tests for `DailyCloseFacade` - changeStatus success
- [ ] 4.6 Write unit tests for `DailyCloseFacade` - changeStatus error with rollback
- [ ] 4.7 Write unit tests for `DailyCloseFacade` - canCloseDay computed signal
- [ ] 4.8 Write unit tests for `AppointmentActionService` - command creation
- [ ] 4.9 Write unit tests for `AppointmentActionService` - command execution
- [ ] 4.10 Write unit tests for `StatusChangeCommand`
- [ ] 4.11 Write unit tests for `CloseDayCommand`
- [ ] 4.12 Rewrite `DailyCloseComponent` tests - initialization
- [ ] 4.13 Rewrite `DailyCloseComponent` tests - status change flow
- [ ] 4.14 Rewrite `DailyCloseComponent` tests - close day flow
- [ ] 4.15 Rewrite `DailyCloseComponent` tests - error handling
- [ ] 4.16 Rewrite `DailyCloseComponent` tests - loading states
- [ ] 4.17 Run coverage report and verify >95% coverage
- [ ] 4.18 Fix any coverage gaps identified

## 5. Phase 5 - Validation and Cleanup

- [ ] 5.1 Run all tests - ensure 100% pass rate
- [ ] 5.2 Run linting checks
- [ ] 5.3 Manual testing of status change flow
- [ ] 5.4 Manual testing of daily close flow
- [ ] 5.5 Manual testing of error scenarios
- [ ] 5.6 Verify no console errors or warnings
- [ ] 5.7 Compare performance metrics (before/after)
- [ ] 5.8 Update any relevant documentation
- [ ] 5.9 Code review with team
- [ ] 5.10 Merge to main branch
