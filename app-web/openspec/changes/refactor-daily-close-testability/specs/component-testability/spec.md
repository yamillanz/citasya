# ComponentTestability Specification

## Overview
Patterns and practices for making Angular components testable, including dependency injection patterns, component architecture, and testing strategies.

## Functional Requirements

### FR1: Single Responsibility
- **Given** a component is designed
- **Then** it should handle UI presentation only
- **And** delegate business logic to services
- **And** not contain API calls directly

### FR2: Dependency Injection
- **Given** a component has dependencies
- **When** it is instantiated
- **Then** all dependencies should be injectable
- **And** dependencies should use interfaces where possible
- **And** services should use `providedIn: 'root'` or component-level providers

### FR3: Signal-Based State
- **Given** component state exists
- **Then** it should use Angular signals
- **And** expose readonly signals for read operations
- **And** use computed() for derived state
- **And** state mutations should happen through services

### FR4: OnPush Change Detection
- **Given** a component is created
- **Then** it should use `ChangeDetectionStrategy.OnPush`
- **And** rely on signals for change detection
- **And** minimize manual change detection triggers

## Patterns

### Facade Pattern
Components interact with a single facade service that aggregates all business logic:
```typescript
export class MyComponent {
  private readonly facade = inject(MyFacade);
  readonly data = this.facade.data;
}
```

### Interface Abstraction
External dependencies (dialogs, storage, etc.) use interfaces:
```typescript
export class MyComponent {
  private readonly dialog = inject(IConfirmationDialog);
}
```

### Mock Provider Strategy
TestBed configuration uses mock implementations:
```typescript
providers: [
  { provide: IConfirmationDialog, useClass: MockConfirmationDialog }
]
```

## Test Requirements
- >95% code coverage
- All public methods tested
- All UI interactions tested
- All error paths tested
- No real API calls in tests
