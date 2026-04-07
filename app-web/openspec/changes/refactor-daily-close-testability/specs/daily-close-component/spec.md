# DailyCloseComponent (Delta) Specification

## Overview
Delta specification for the refactored DailyCloseComponent. The component will transition from mixed concerns to a pure UI presentation layer.

## Changes from Current Implementation

### Removed Responsibilities
- ❌ Direct API calls
- ❌ Business logic for status validation
- ❌ State management for appointments
- ❌ Confirmation dialog instantiation
- ❌ Error handling logic

### Retained Responsibilities
- ✅ UI template and layout
- ✅ Event handler delegation
- ✅ Input/output bindings
- ✅ Display logic (computed visibility)
- ✅ PrimeNG component integration

## Functional Requirements

### FR1: Component Initialization
- **Given** the component is created
- **When** `ngOnInit()` runs
- **Then** it should call `facade.loadAppointments(date)`
- **And** display loading state from facade

### FR2: Status Change Flow
- **Given** user clicks status change button
- **When** the handler is invoked
- **Then** it should call `dialog.confirm()`
- **And** on confirmation, call `facade.changeStatus()`
- **And** display result from facade state

### FR3: Daily Close Flow
- **Given** user clicks close day button
- **When** the handler is invoked
- **Then** it should validate `facade.canCloseDay()`
- **And** call `dialog.confirm()` for confirmation
- **And** on confirmation, call `facade.closeDay()`

### FR4: Display Bindings
- **Given** facade state changes
- **Then** template should react to signals
- **And** loading states should show/hide
- **And** error messages should display
- **And** appointment list should render

## Interface

```typescript
@Component({
  selector: 'app-daily-close',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DailyCloseComponent {
  private readonly facade = inject(DailyCloseFacade);
  private readonly dialog = inject(IConfirmationDialog);
  
  // Signal-based template bindings
  readonly appointments = this.facade.appointments;
  readonly loading = this.facade.loading;
  readonly error = this.facade.error;
  readonly canCloseDay = this.facade.canCloseDay;
  
  // Event handlers
  onChangeStatus(appointment: Appointment): Promise<void>;
  onCloseDay(): Promise<void>;
  onRefresh(): Promise<void>;
}
```

## Test Requirements
- 100% code coverage
- All event handlers tested
- All UI states tested
- Facade methods mocked
- Dialog interactions mocked
