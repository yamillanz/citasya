# Tasks: DailyCloseComponent Testability Refactoring

## Phase 1: Create Abstraction Layer

### 1.1 Create Confirmation Dialog Interface
- [ ] Create `src/app/core/interfaces/confirmation-dialog.interface.ts`
- [ ] Define `ConfirmationOptions` interface
- [ ] Define `IConfirmationDialog` interface
- [ ] Export from index if applicable

### 1.2 Create Injection Token
- [ ] Create `src/app/core/tokens/confirmation-dialog.token.ts`
- [ ] Define `CONFIRMATION_DIALOG` injection token
- [ ] Export from index if applicable

### 1.3 Create PrimeNG Implementation
- [ ] Create `src/app/core/services/primeng-confirmation-dialog.service.ts`
- [ ] Implement `IConfirmationDialog` interface
- [ ] Map options to PrimeNG format
- [ ] Return Observable<boolean> for confirm/reject

### 1.4 Configure Provider
- [ ] Add provider to `app.config.ts`
- [ ] Register `PrimeNGConfirmationDialog` for `CONFIRMATION_DIALOG` token

## Phase 2: Create DailyCloseFacade

### 2.1 Create Facade Service
- [ ] Create `src/app/features/backoffice/manager/daily-close/daily-close.facade.ts`
- [ ] Define `DailyCloseState` interface
- [ ] Create state signal with initial values
- [ ] Create computed signals for each state property
- [ ] Implement `checkCanClose()` method
- [ ] Implement `executeClose()` method
- [ ] Implement `clearError()` method

### 2.2 Write Facade Tests
- [ ] Create `daily-close.facade.spec.ts`
- [ ] Test initial state
- [ ] Test `checkCanClose()` - loading state
- [ ] Test `checkCanClose()` - success case
- [ ] Test `checkCanClose()` - error case
- [ ] Test `executeClose()` - success case
- [ ] Test `executeClose()` - error case
- [ ] Test `clearError()`
- [ ] Verify >95% coverage

## Phase 3: Create Testing Mocks

### 3.1 Create MockConfirmationDialog
- [ ] Create `src/app/features/backoffice/manager/daily-close/testing/mock-confirmation-dialog.ts`
- [ ] Implement `IConfirmationDialog` interface
- [ ] Add `setNextResponse()` method
- [ ] Add `getLastOptions()` method
- [ ] Add `getCallCount()` method
- [ ] Add `reset()` method

### 3.2 Create Testing Module
- [ ] Create `src/app/features/backoffice/manager/daily-close/testing/index.ts`
- [ ] Export `MockConfirmationDialog`
- [ ] Add any testing utilities

## Phase 4: Refactor Component

### 4.1 Update Component Class
- [ ] Modify `daily-close.component.ts`
- [ ] Remove direct dependency on `ConfirmationService`
- [ ] Inject `DailyCloseFacade`
- [ ] Inject `CONFIRMATION_DIALOG` token
- [ ] Move business logic to `DailyCloseFacade`
- [ ] Simplify `onCloseClick()` to use facade
- [ ] Add `onRetry()` handler
- [ ] Add `onDismissError()` handler

### 4.2 Update Component Template
- [ ] Update bindings to use `facade.isLoading()`
- [ ] Update bindings to use `facade.error()`
- [ ] Update bindings to use `facade.canClose()`
- [ ] Update event handlers
- [ ] Verify no PrimeNG confirmation service usage remains

## Phase 5: Write Component Tests

### 5.1 Setup Test Bed
- [ ] Update `daily-close.component.spec.ts`
- [ ] Provide mock for `DailyCloseFacade`
- [ ] Provide `MockConfirmationDialog` for `CONFIRMATION_DIALOG`
- [ ] Setup component with TestBed

### 5.2 Write Test Cases
- [ ] Test initial load calls `facade.checkCanClose()`
- [ ] Test loading state displays spinner
- [ ] Test button enabled when `canClose` is true
- [ ] Test button disabled when `canClose` is false
- [ ] Test error message displays when error exists
- [ ] Test close click shows confirmation dialog
- [ ] Test confirm calls `facade.executeClose()`
- [ ] Test cancel does NOT call `facade.executeClose()`
- [ ] Test success shows success message
- [ ] Test retry button calls `facade.checkCanClose()`
- [ ] Test dismiss error calls `facade.clearError()`

### 5.3 Verify Coverage
- [ ] Run `npm run test:coverage`
- [ ] Verify component coverage >95%
- [ ] Verify facade coverage >95%

## Phase 6: Integration & Verification

### 6.1 Integration Testing
- [ ] Run full test suite
- [ ] Verify no breaking changes
- [ ] Test manually in browser
- [ ] Verify confirmation dialogs work
- [ ] Verify error handling works
- [ ] Verify success flow works

### 6.2 Code Review Items
- [ ] All new files have proper imports
- [ ] No console.log statements
- [ ] Proper error messages
- [ ] TypeScript strict mode compliance
- [ ] Change detection OnPush where applicable
- [ ] Proper use of signals in templates (with `()`)

### 6.3 Documentation
- [ ] Update component JSDoc if needed
- [ ] Add facade JSDoc comments
- [ ] Document public methods
- [ ] Update README if applicable

## Completion Criteria

- [ ] All tasks complete
- [ ] Component coverage >95%
- [ ] Facade coverage >95%
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Manual testing successful
- [ ] Ready for archive

## File Checklist

### New Files (9):
- [ ] `src/app/core/interfaces/confirmation-dialog.interface.ts`
- [ ] `src/app/core/tokens/confirmation-dialog.token.ts`
- [ ] `src/app/core/services/primeng-confirmation-dialog.service.ts`
- [ ] `src/app/features/backoffice/manager/daily-close/daily-close.facade.ts`
- [ ] `src/app/features/backoffice/manager/daily-close/daily-close.facade.spec.ts`
- [ ] `src/app/features/backoffice/manager/daily-close/testing/mock-confirmation-dialog.ts`
- [ ] `src/app/features/backoffice/manager/daily-close/testing/index.ts`

### Modified Files (3):
- [ ] `src/app/app.config.ts`
- [ ] `src/app/features/backoffice/manager/daily-close/daily-close.component.ts`
- [ ] `src/app/features/backoffice/manager/daily-close/daily-close.component.spec.ts`
