# Delta Spec: DailyCloseComponent Refactoring

## Feature: Transform Component to UI-Only

### Requirement 1: Component Dependencies
**Given** the component is being refactored
**When** it is rewritten
**Then** it should inject:
```typescript
readonly #facade = inject(DailyCloseFacade);
readonly #confirmationDialog = inject(CONFIRMATION_DIALOG);
```

**And** it should NOT directly inject:
- ❌ `HttpClient`
- ❌ `ConfirmationService` (from PrimeNG)
- ❌ Any API service for daily close

### Requirement 2: Template Bindings
**Given** the component uses the facade
**When** the template is rendered
**Then** all state should come from facade signals:
```html
@if (facade.isLoading()) {
  <p-progressSpinner />
}

@if (facade.error()) {
  <p-message severity="error" [text]="facade.error()" />
}

<p-button 
  [disabled]="!facade.canClose() || facade.isLoading()"
  (onClick)="onCloseClick()">
  Close Day
</p-button>
```

### Requirement 3: Event Handlers
**Given** the user interacts with the component
**When** actions are triggered
**Then** handlers should delegate to facade:

```typescript
onCloseClick(): void {
  this.#confirmationDialog.confirm({
    title: 'Confirm Daily Close',
    message: 'Are you sure you want to close the day?',
    confirmLabel: 'Close',
    cancelLabel: 'Cancel',
    severity: 'warning'
  }).pipe(
    filter(confirmed => confirmed),
    switchMap(() => this.#facade.executeClose())
  ).subscribe({
    next: () => this.showSuccess(),
    error: () => {} // Error handled by facade
  });
}

onRetry(): void {
  this.#facade.checkCanClose();
}

onDismissError(): void {
  this.#facade.clearError();
}
```

### Requirement 4: Lifecycle Integration
**Given** the component initializes
**When** `ngOnInit` is called
**Then** it should:
```typescript
ngOnInit(): void {
  this.#facade.checkCanClose();
}
```

### Requirement 5: No Direct State Mutation
**Given** the component renders UI
**When** any user interaction occurs
**Then** the component should NEVER:
- ❌ Modify state directly (e.g., `this.loading.set(true)`)
- ❌ Call HTTP endpoints directly
- ❌ Access localStorage/sessionStorage for business logic
- ❌ Perform complex calculations or validations

**Instead**, all state changes should flow through the facade.
