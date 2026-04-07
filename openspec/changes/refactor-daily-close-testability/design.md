# Technical Design: DailyCloseComponent Refactoring

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    DailyCloseComponent                   │
│                    (UI Layer - "Dumb")                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Template Bindings                                  │  │
│  │ - {{ facade.isLoading() }}                        │  │
│  │ - {{ facade.error() }}                            │  │
│  │ - [disabled]="!facade.canClose()"                 │  │
│  │ Event Handlers: onCloseClick(), onRetry()         │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ injects
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    DailyCloseFacade                      │
│              (Business Logic Layer)                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │ State (Signals)                                   │  │
│  │ - state = signal<DailyCloseState>(...)           │  │
│  │ - Computed: isLoading, error, canClose           │  │
│  │ Actions: checkCanClose(), executeClose()         │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ injects
                          ▼
┌─────────────────────────────────────────────────────────┐
│              DailyCloseApiService                        │
│              (HTTP/API Layer)                            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              IConfirmationDialog Abstraction             │
│  ┌─────────────────┐         ┌──────────────────────┐  │
│  │  Interface      │◄────────│  Mock (Tests)        │  │
│  │                 │         │  - MockConfirmation  │  │
│  └─────────────────┘         └──────────────────────┘  │
│           ▲                                            │
│           │ injects                                    │
│  ┌────────┴──────────┐                                 │
│  │  PrimeNG Impl     │                                 │
│  │  - Uses Confirm.  │                                 │
│  │    Service        │                                 │
│  └───────────────────┘                                 │
└─────────────────────────────────────────────────────────┘
```

## Implementation Details

### 1. DailyCloseFacade Service

**Location:** `src/app/features/backoffice/manager/daily-close/daily-close.facade.ts`

**Key Design Decisions:**
- Uses Angular Signals for reactive state management
- Exposes readonly signals to prevent external mutation
- Returns Observables from async actions to allow component-level error handling
- Encapsulates all daily close business logic

**State Shape:**
```typescript
interface DailyCloseState {
  isLoading: boolean;
  error: string | null;
  canClose: boolean;
  lastCloseDate: Date | null;
}
```

**API:**
```typescript
@Injectable()
export class DailyCloseFacade {
  readonly state: Signal<DailyCloseState>;
  readonly isLoading: Signal<boolean>;
  readonly error: Signal<string | null>;
  readonly canClose: Signal<boolean>;
  readonly lastCloseDate: Signal<Date | null>;
  
  checkCanClose(): void;
  executeClose(): Observable<void>;
  clearError(): void;
}
```

### 2. IConfirmationDialog Abstraction

**Location:** 
- Interface: `src/app/core/interfaces/confirmation-dialog.interface.ts`
- Injection Token: `src/app/core/tokens/confirmation-dialog.token.ts`
- PrimeNG Impl: `src/app/core/services/primeng-confirmation-dialog.service.ts`

**Design Pattern:** Strategy Pattern with Dependency Injection

**Interface:**
```typescript
export interface ConfirmationOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  severity?: 'info' | 'warning' | 'danger';
}

export interface IConfirmationDialog {
  confirm(options: ConfirmationOptions): Observable<boolean>;
}
```

**Benefits:**
- Testability: Easy to mock in unit tests
- Flexibility: Can swap implementations (PrimeNG, Material, custom)
- Framework independence: Component doesn't know about PrimeNG

### 3. DailyCloseComponent Refactor

**Location:** `src/app/features/backoffice/manager/daily-close/daily-close.component.ts`

**Responsibilities After Refactor:**
1. Render UI based on facade state
2. Handle user interactions
3. Delegate to facade for business logic
4. Show confirmation dialog via abstraction

**What It Won't Do:**
- No direct HTTP calls
- No state management
- No complex business logic
- No direct dialog service usage

### 4. Mock Implementations

**Location:** `src/app/features/backoffice/manager/daily-close/testing/`

**MockConfirmationDialog:**
```typescript
export class MockConfirmationDialog implements IConfirmationDialog {
  private nextResponse = new BehaviorSubject<boolean>(true);
  private lastOptions: ConfirmationOptions | undefined;
  private callCount = 0;
  
  confirm(options: ConfirmationOptions): Observable<boolean> {
    this.lastOptions = options;
    this.callCount++;
    return this.nextResponse.pipe(take(1));
  }
  
  setNextResponse(response: boolean): void;
  getLastOptions(): ConfirmationOptions | undefined;
  getCallCount(): number;
  reset(): void;
}
```

## Testing Strategy

### Component Tests
- Mock `DailyCloseFacade` entirely - test only UI behavior
- Mock `IConfirmationDialog` using `MockConfirmationDialog`
- Test: rendering, button states, event delegation

### Facade Tests
- Mock `DailyCloseApiService` at HTTP level
- Test: state transitions, error handling, API integration

### Service Tests
- Use `HttpTestingController` for API service
- Test: request/response handling, error mapping

## SOLID Principles Applied

| Principle | Application |
|-----------|-------------|
| **S**ingle Responsibility | Component = UI only, Facade = Business logic only |
| **O**pen/Closed | New confirmation implementations don't change component |
| **L**iskov Substitution | MockConfirmationDialog interchangeable with PrimeNG impl |
| **I**nterface Segregation | IConfirmationDialog has single, focused purpose |
| **D**ependency Inversion | Component depends on abstraction, not concrete dialog service |

## Files to Create/Modify

### New Files:
1. `daily-close.facade.ts` - New service with business logic
2. `confirmation-dialog.interface.ts` - Interface definition
3. `confirmation-dialog.token.ts` - Injection token
4. `primeng-confirmation-dialog.service.ts` - PrimeNG implementation
5. `mock-confirmation-dialog.ts` - Mock for testing
6. `index.ts` - Testing module exports

### Modified Files:
1. `daily-close.component.ts` - Refactored to UI-only
2. `daily-close.component.spec.ts` - Comprehensive tests
3. `daily-close.facade.spec.ts` - Facade unit tests
4. `app.config.ts` - Add confirmation dialog provider

## Migration Steps

1. Create abstraction layer (interface + token + PrimeNG impl)
2. Create DailyCloseFacade with tests
3. Refactor component to use facade and abstraction
4. Update component tests with mocks
5. Add provider to app config
6. Verify all existing functionality works
7. Run coverage report to validate >95%
