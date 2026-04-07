## Why

The DailyCloseComponent currently contains mixed concerns - both UI presentation logic and business logic for managing appointments, status changes, and confirmation dialogs. This tight coupling makes the component difficult to unit test, with current test coverage below acceptable thresholds. By extracting business logic into dedicated services and implementing proper dependency injection patterns, we can achieve >95% test coverage while following SOLID principles.

## What Changes

- **Create DailyCloseFacade service** to extract all business logic from the component
- **Create IConfirmationDialog interface** with PrimeNG and mock implementations for testability
- **Create AppointmentActionService** using Command pattern to encapsulate appointment operations
- **Refactor DailyCloseComponent** to be UI-only with proper dependency injection
- **Rewrite unit tests** to achieve >95% coverage with proper mocking strategies

## Capabilities

### New Capabilities
- `daily-close-facade`: Centralized business logic service for daily close operations
- `confirmation-dialog-interface`: Abstraction layer for confirmation dialogs with PrimeNG and mock implementations
- `appointment-action-service`: Command pattern implementation for appointment CRUD operations
- `component-testability`: Patterns and practices for making Angular components testable

### Modified Capabilities
- `daily-close-component`: Refactoring to UI-only responsibilities, removing business logic

## Impact

- **Affected Files**:
  - `src/app/features/backoffice/employee/daily-close/daily-close.component.ts`
  - `src/app/features/backoffice/employee/daily-close/daily-close.component.spec.ts`
  - New: `src/app/core/services/daily-close.facade.ts`
  - New: `src/app/core/interfaces/confirmation-dialog.interface.ts`
  - New: `src/app/core/services/appointment-action.service.ts`
  - New: `src/app/core/testing/mock-confirmation-dialog.service.ts`

- **Dependencies**: PrimeNG confirmation dialog, Angular Testing Framework
- **Breaking Changes**: None - all changes are internal refactoring with preserved component API
