# Delta Spec: Testing Requirements

## Feature: Comprehensive Test Coverage

### Requirement 1: Test Structure
**Given** tests are being written
**When** organizing test files
**Then** they should be located at:
```
src/app/features/backoffice/manager/daily-close/
├── daily-close.component.spec.ts
├── daily-close.facade.spec.ts
└── testing/
    ├── mock-confirmation-dialog.ts
    └── index.ts
```

### Requirement 2: Component Test Coverage
**Given** the DailyCloseComponent tests
**When** running coverage report
**Then** coverage should be:
- Statements: >95%
- Branches: >95%
- Functions: >95%
- Lines: >95%

### Requirement 3: Component Test Scenarios
**Given** the component is tested
**Then** tests must cover:

| Scenario | Description |
|----------|-------------|
| Initial load | Component initializes and calls facade.checkCanClose() |
| Loading state | Spinner shown when facade.isLoading() is true |
| Can close | Button enabled when facade.canClose() is true |
| Cannot close | Button disabled when facade.canClose() is false |
| Error display | Error message shown when facade.error() has value |
| Close click | Confirmation dialog shown on close button click |
| Confirm close | Facade.executeClose() called when confirmed |
| Cancel close | Facade.executeClose() NOT called when cancelled |
| Success handling | Success message shown on successful close |
| Retry | facade.checkCanClose() called on retry |
| Dismiss error | facade.clearError() called on dismiss |

### Requirement 4: Facade Test Coverage
**Given** the DailyCloseFacade tests
**When** running coverage report
**Then** coverage should be:
- Statements: >95%
- Branches: >95%
- Functions: >95%
- Lines: >95%

### Requirement 5: Facade Test Scenarios
**Given** the facade is tested
**Then** tests must cover:

| Scenario | Description |
|----------|-------------|
| Initial state | Correct default state values |
| Check can close loading | isLoading true during check |
| Check can close success | canClose and lastCloseDate updated |
| Check can close error | error state set on failure |
| Execute close loading | isLoading true during execution |
| Execute close success | State updated, Observable completes |
| Execute close error | error state set, Observable errors |
| Clear error | error reset to null |

### Requirement 6: Mock Helpers
**Given** mock implementations are needed
**Then** the following should be provided:

```typescript
// MockConfirmationDialog
class MockConfirmationDialog {
  setNextResponse(response: boolean): void;
  getLastOptions(): ConfirmationOptions | undefined;
  getCallCount(): number;
  reset(): void;
}

// createMockDailyCloseService
function createMockDailyCloseService(): {
  checkCanClose: jest.Mock;
  executeClose: jest.Mock;
};
```

### Requirement 7: Test Performance
**Given** tests are executed
**When** measuring execution time
**Then** each test should complete in <50ms (excluding async setup)
