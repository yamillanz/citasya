# Tasks: add-refresh-button

## Phase 1: Backoffice Employee Calendar Refresh Button

- [x] 1.1 Add `refreshData()` method to `employee-calendar.component.ts` (backoffice) that calls `this.loadAppointments()`
- [x] 1.2 Add refresh `p-button` in `employee-calendar.component.html` (backoffice) before the "Tu link" button in the `.calendar-header` div, with `icon="pi pi-refresh"`, `[loading]="loading()"`, `(onClick)="refreshData()"`, `styleClass="refresh-btn"`, `[outlined]="true"`, `tooltip="Actualizar datos"`
- [x] 1.3 Add `.refresh-btn` styles in `employee-calendar.component.scss` (backoffice) using `:host ::ng-deep` pattern with `padding: var(--space-xs)`, `min-width: 36px`, `max-width: 36px`, and `.p-button-icon { font-size: 0.875rem }`

## Phase 2: Public Employee Calendar Refresh Button

- [x] 2.1 Add `refreshSlots()` method to `employee-calendar.component.ts` (public) that calls `this.loadAvailableSlots()` — only if `selectedDate()` and `selectedServiceIds().length > 0`, otherwise no-op
- [x] 2.2 Add refresh `p-button` in `employee-calendar.component.html` (public) inside the `.slots-header` div, next to the `.selected-datetime` element, with `icon="pi pi-refresh"`, `[loading]="loading()"`, `(onClick)="refreshSlots()"`, `styleClass="refresh-btn"`, `[outlined]="true"`, `tooltip="Actualizar horarios"`, `tooltipPosition="bottom"`
- [x] 2.3 Add `.refresh-btn` styles in `employee-calendar.component.scss` (public) matching the same pattern as Phase 1

## Phase 3: Daily Close Refresh Button

- [x] 3.1 Add `refreshData()` method to `daily-close.component.ts` that calls `this.facade.loadAppointments()`
- [x] 3.2 Add refresh `p-button` in `daily-close.component.html` inside the `.date-nav` flex container, between the `.date-display` div and the `p-datepicker`, with `icon="pi pi-refresh"`, `[loading]="loading()"`, `(onClick)="refreshData()"`, `styleClass="refresh-btn"`, `[outlined]="true"`, `tooltip="Actualizar datos"`, `tooltipPosition="bottom"`
- [x] 3.3 Add `.refresh-btn` styles in `daily-close.component.scss` matching the same pattern as Phase 1

## Phase 4: Manager Appointments Refresh Button

- [x] 4.1 Add `refreshData()` method to `appointments.component.ts` that calls `this.loadData()`, with loading state management
- [x] 4.2 Add refresh `p-button` in `appointments.component.html` header area next to the title, with `icon="pi pi-refresh"`, `[loading]="loading()"`, `(onClick)="refreshData()"`, `styleClass="refresh-btn"`, `[outlined]="true"`, `tooltip="Actualizar datos"`, `tooltipPosition="left"`
- [x] 4.3 Add `TooltipModule` import to `appointments.component.ts`
- [x] 4.4 Add `.refresh-btn` styles in `appointments.component.scss` matching the same pattern

## Phase 5: Verification

- [x] 5.1 Verify backoffice employee calendar: refresh button appears before "Tu link", clicking it reloads appointment data, button shows spinner while loading, button is disabled during loading
- [x] 5.2 Verify public employee calendar: refresh button appears next to selected date in slots section, clicking it reloads available slots, button shows spinner while loading, button is disabled during loading
- [x] 5.3 Verify daily close: refresh button appears between "Fecha seleccionada" and date picker, clicking it reloads appointment data, button shows spinner while loading, button is disabled during loading
- [x] 5.4 Verify responsive behavior: refresh buttons are properly sized and positioned on mobile viewports