# Tasks: Fix Appointments Filter Reload

## Phase 1: Template Restructure

- [x] 1.1 Move `<div class="filters-bar">` and `<div class="view-toggle">` blocks outside the `@if (loading())` / `@else` conditional in `appointments.component.html`
- [x] 1.2 Restructure the `@if (loading())` block so it only wraps the data content area (stats row + appointments list/calendar + empty state), not the filters
- [x] 1.3 Verify the loading spinner appears only in the data content area, not over the filters
- [x] 1.4 Add a CSS class or binding to visually indicate the filters bar is in a loading state (e.g., `[class.loading]="loading()"` on the filters bar)

## Phase 2: Fix PrimeNG Bindings

- [x] 2.1 Replace `p-datepicker` binding from `[(ngModel)]="filterDate"` + `(ngModelChange)="onFilterChange()"` to `[ngModel]="filterDate()"` + `(onSelect)="onDateSelect($event)"` + `(onClear)="onDateClear()"` + `[ngModelOptions]="{standalone: true}"`
- [x] 2.2 Replace `p-select` (employee) binding from `[(ngModel)]="filterEmployee"` + `(ngModelChange)="onFilterChange()"` to `[ngModel]="filterEmployee()"` + `(onChange)="onEmployeeChange($event)"` + `[ngModelOptions]="{standalone: true}"`
- [x] 2.3 Replace `p-select` (status) binding from `[(ngModel)]="filterStatus"` + `(ngModelChange)="onFilterChange()"` to `[ngModel]="filterStatus()"` + `(onChange)="onStatusChange($event)"` + `[ngModelOptions]="{standalone: true}"`
- [x] 2.4 Verify the search input (`(input)="onSearch($event)"`) does NOT need changes — it's a plain HTML input and should work as-is

## Phase 3: TypeScript Handler Updates

- [x] 3.1 Add `onDateSelect(date: Date)` method that sets `filterDate` signal and calls `debouncedFilterChange()`
- [x] 3.2 Add `onDateClear()` method that sets `filterDate` to `null` and calls `debouncedFilterChange()`
- [x] 3.3 Add `onEmployeeChange(event: any)` method that sets `filterEmployee` signal from `event.value` and calls `debouncedFilterChange()`
- [x] 3.4 Add `onStatusChange(event: any)` method that sets `filterStatus` signal from `event.value` and calls `debouncedFilterChange()`
- [x] 3.5 Add `debouncedFilterChange()` method with 300ms debounce (same pattern as existing `onSearch()`)
- [x] 3.6 Add `private filterTimeout?: ReturnType<typeof setTimeout>` property
- [x] 3.7 Remove the `onFilterChange()` method (replaced by specific handlers)
- [x] 3.8 Update `clearFilters()` to also clear `filterTimeout`
- [x] 3.9 Update `ngOnDestroy()` to also clear `filterTimeout`

## Phase 4: Style Updates

- [x] 4.1 Add `.filters-bar.loading` styles in `appointments.component.scss` — dimmed opacity and `pointer-events: none` during loading
- [x] 4.2 Ensure the loading spinner is properly positioned within the data content area (not full-page)

## Phase 5: Verification (Manual Testing Required)

- [x] 5.1 Manual test: Select a status filter → verify data loads filtered → verify filter remains selected after loading
- [x] 5.2 Manual test: Select an employee filter → verify data loads filtered → verify filter remains selected after loading
- [x] 5.3 Manual test: Select a date filter → verify data loads filtered → verify filter remains selected after loading
- [x] 5.4 Manual test: Use search input → verify data loads filtered → verify search text persists
- [x] 5.5 Manual test: Combine multiple filters → verify all persist through loading
- [x] 5.6 Manual test: Click "Limpiar filtros" → verify all filters clear and data reloads unfiltered
- [x] 5.7 Manual test: Initial page load → verify filters bar is visible during initial loading
- [x] 5.8 Manual test: Rapid filter changes → verify debounce prevents multiple API calls
- [x] 5.9 Verify no regression in drawer functionality (status change, payment, etc.)
- [x] 5.10 Verify no regression in infinite scroll (load more) functionality