# Delta Spec: DailyCloseFacade Service

## Feature: Extract Business Logic to Facade Service

### Requirement 1: Service Interface
**Given** the need to extract business logic from DailyCloseComponent
**When** the DailyCloseFacade is created
**Then** it should expose the following interface:

```typescript
interface DailyCloseState {
  isLoading: boolean;
  error: string | null;
  canClose: boolean;
  lastCloseDate: Date | null;
}

class DailyCloseFacade {
  // State signals
  readonly state: Signal<DailyCloseState>;
  
  // Computed selectors
  readonly isLoading: Signal<boolean>;
  readonly error: Signal<string | null>;
  readonly canClose: Signal<boolean>;
  readonly lastCloseDate: Signal<Date | null>;
  
  // Actions
  checkCanClose(): void;
  executeClose(): Observable<void>;
  clearError(): void;
}
```

### Requirement 2: State Management
**Given** the facade is initialized
**When** no actions have been performed
**Then** the state should be:
```typescript
{
  isLoading: false,
  error: null,
  canClose: false,
  lastCloseDate: null
}
```

### Requirement 3: Check Can Close
**Given** the user wants to perform a daily close
**When** `checkCanClose()` is called
**Then** it should:
1. Set `isLoading` to true
2. Call the API to check if daily close is allowed
3. Update `canClose` and `lastCloseDate` based on response
4. Set `isLoading` to false
5. Handle errors by setting the `error` state

### Requirement 4: Execute Close
**Given** daily close is confirmed by user
**When** `executeClose()` is called
**Then** it should:
1. Set `isLoading` to true
2. Call the API to execute daily close
3. Clear `canClose` on success
4. Set `isLoading` to false
5. Return Observable that completes on success or errors on failure

### Requirement 5: Error Handling
**Given** an API call fails
**When** the error is received
**Then** it should:
1. Set `error` state with user-friendly message
2. Set `isLoading` to false
3. Allow `clearError()` to reset error state to null
