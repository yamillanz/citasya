# Design: add-refresh-button

## Architecture Decisions

### Decision: Icon-only button using PrimeNG p-button
**Chose** PrimeNG `p-button` with `icon` property and no label, using `pi-refresh` icon.
**Over** Custom HTML button or icon-only approach.
**Because**: All three components already import `ButtonModule` from PrimeNG. Using `p-button` ensures visual consistency with the existing UI (the daily close already uses `p-button` for navigation). The icon-only variant with `[outlined]="true"` matches the existing nav buttons style.

### Decision: Reuse existing loading signals
**Chose** to bind the button's disabled/loading state to the component's existing `loading` signal.
**Over** Creating a separate `refreshing` signal.
**Because**: The data-loading methods already set `loading = true` at the start and `loading = false` at the end. Adding a separate signal would create inconsistency — if the calendar is loading for any reason, the refresh button should also be disabled. The existing `loading` signal is the single source of truth.

### Decision: Reuse existing data-loading methods
**Chose** to call the existing `loadAppointments()` / `loadAvailableSlots()` methods directly.
**Over** Creating new refresh-specific methods.
**Because**: These methods already handle all the data fetching, state updates, and error handling. Duplicating logic would violate DRY. The refresh button simply re-triggers the same flow.

### Decision: Placement per component context
- **Backoffice employee calendar**: In the `.calendar-header` div, before the "Tu link" button — this is the natural action bar for the view.
- **Public employee calendar**: In the `.slots-header` div, next to the `.selected-datetime` display — this is where the user sees the data they might want to refresh.
- **Daily close**: In the `.date-nav` flex container, between the `.date-display` and the date picker — this is the navigation bar where date-related actions live.

## Data Flow

### Backoffice Employee Calendar
1. User clicks refresh button → `refreshData()` method called
2. `refreshData()` calls existing `loadAppointments()`
3. `loadAppointments()` sets `loading.set(true)`, fetches data, sets `loading.set(false)`
4. Button is disabled while `loading() === true`, icon shows spinner

### Public Employee Calendar
1. User clicks refresh button → `refreshSlots()` method called
2. `refreshSlots()` calls existing `loadAvailableSlots()`
3. `loadAvailableSlots()` fetches fresh slots for current date/services
4. Button is disabled while `loading() === true`, icon shows spinner

### Daily Close
1. User clicks refresh button → `refreshData()` method called
2. `refreshData()` calls `facade.loadAppointments()`
3. Facade sets `_loading.set(true)`, fetches data, sets `_loading.set(false)`
4. Button is disabled while `loading() === true`, icon shows spinner

## File Changes

### Modified Files

| File | Change |
|------|--------|
| `app-web/src/app/features/backoffice/employee/calendar/employee-calendar.component.ts` | Add `refreshData()` method |
| `app-web/src/app/features/backoffice/employee/calendar/employee-calendar.component.html` | Add refresh button before "Tu link" |
| `app-web/src/app/features/backoffice/employee/calendar/employee-calendar.component.scss` | Add `.refresh-btn` styles |
| `app-web/src/app/features/public/employee-calendar/employee-calendar.component.ts` | Add `refreshSlots()` method |
| `app-web/src/app/features/public/employee-calendar/employee-calendar.component.html` | Add refresh button in slots header |
| `app-web/src/app/features/public/employee-calendar/employee-calendar.component.scss` | Add `.refresh-btn` styles |
| `app-web/src/app/features/backoffice/manager/daily-close/daily-close.component.ts` | Add `refreshData()` method |
| `app-web/src/app/features/backoffice/manager/daily-close/daily-close.component.html` | Add refresh button in date nav |
| `app-web/src/app/features/backoffice/manager/daily-close/daily-close.component.scss` | Add `.refresh-btn` styles |

### No New Files
All changes are modifications to existing files. No new components, services, or modules needed.

## Component Details

### Refresh Button Template Pattern
All three components use the same PrimeNG button pattern:
```html
<p-button
  icon="pi pi-refresh"
  [loading]="loading()"
  (onClick)="refreshData()"
  styleClass="refresh-btn"
  [outlined]="true"
  tooltip="Actualizar datos"
  tooltipPosition="bottom">
</p-button>
```

Note: When `loading` is true, PrimeNG automatically swaps the icon to a spinner.

### Refresh Method Pattern
Each component adds a simple method that delegates to the existing data loader:
```typescript
async refreshData(): Promise<void> {
  await this.loadAppointments(); // or loadAvailableSlots()
}
```

### Styling Pattern
The refresh button uses a consistent style across all three components:
```scss
:host ::ng-deep .refresh-btn {
  padding: var(--space-xs) !important;
  min-width: 36px !important;
  max-width: 36px !important;
  
  .p-button-icon {
    font-size: 0.875rem;
  }
}
```