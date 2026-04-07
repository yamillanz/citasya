# Delta Spec: IConfirmationDialog Abstraction

## Feature: Create Testable Confirmation Dialog Interface

### Requirement 1: Interface Definition
**Given** the need to abstract confirmation dialogs for testability
**When** the IConfirmationDialog interface is created
**Then** it should be defined as:

```typescript
interface ConfirmationOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  severity?: 'info' | 'warning' | 'danger';
}

interface IConfirmationDialog {
  confirm(options: ConfirmationOptions): Observable<boolean>;
}
```

### Requirement 2: PrimeNG Implementation
**Given** the application uses PrimeNG
**When** the PrimeNGConfirmationDialog implementation is created
**Then** it should:
1. Implement `IConfirmationDialog` interface
2. Use PrimeNG's `ConfirmationService` internally
3. Map `ConfirmationOptions` to PrimeNG's confirmation format
4. Return Observable that emits `true` on confirm, `false` on reject
5. Complete the Observable after user interaction

### Requirement 3: Injection Token
**Given** the abstraction requires dependency injection
**When** the injection token is created
**Then** it should be:
```typescript
export const CONFIRMATION_DIALOG = new InjectionToken<IConfirmationDialog>('ConfirmationDialog');
```

### Requirement 4: Provider Configuration
**Given** the application needs to provide the implementation
**When** configuring providers in app config
**Then** it should provide:
```typescript
{
  provide: CONFIRMATION_DIALOG,
  useClass: PrimeNGConfirmationDialog
}
```

### Requirement 5: Mock Implementation for Testing
**Given** tests need to mock the confirmation dialog
**When** the MockConfirmationDialog is created
**Then** it should:
1. Implement `IConfirmationDialog` interface
2. Allow programmatic control of the response
3. Record calls for assertions
4. Support immediate resolution for fast tests

```typescript
class MockConfirmationDialog implements IConfirmationDialog {
  confirm(options: ConfirmationOptions): Observable<boolean>;
  setNextResponse(response: boolean): void;
  getLastOptions(): ConfirmationOptions | null;
  getCallCount(): number;
  reset(): void;
}
```
