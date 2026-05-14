# Proposal: Fix Appointments Filter Reload

## Why

When a user applies any filter (date, employee, status) on the appointments listing page (`/bo/appointments`), the component reloads entirely and clears all filter selections. This makes filtering unusable — the user selects a filter, sees filtered data briefly, then the UI destroys and recreates the filter controls, which resets them to empty values and triggers a second unfiltered load.

The root cause is that the template uses `@if (loading()) { spinner } @else { ENTIRE_UI }`, which destroys all PrimeNG filter components (p-datepicker, p-select) when `loading` becomes `true` during data fetching. When the components are recreated, PrimeNG emits default values through `[(ngModel)]`, overwriting the signal-based filter state and triggering another `resetAndLoad()` with empty filters.

## What Changes

- Restructure the template so the filters bar is **always rendered** (outside the `@if (loading())` conditional)
- Only the data content area (stats, cards/list, calendar) should be replaced by the loading spinner
- Fix the `p-datepicker` binding to use the recommended `(onSelect)` + signal pattern instead of `[(ngModel)]` (per project's AGENTS.md known bug)
- Add debounce to dropdown filter changes (`onFilterChange`) to prevent rapid successive API calls
- Apply the same one-way binding pattern to `p-select` components to prevent spurious emissions

## Scope

### In
- Restructure the template so the filters bar is **always rendered** (outside the `@if (loading())` conditional)
- Only the data content area (stats, cards/list, calendar) should be replaced by the loading spinner
- Fix the `p-datepicker` binding to use the recommended `(onSelect)` + signal pattern instead of `[(ngModel)]` (per project's AGENTS.md known bug)
- Add debounce to dropdown filter changes (`onFilterChange`) to prevent rapid successive API calls
- Ensure the search input value persists visually during loading (it's a plain HTML input, not inside `@if`)

### Out
- URL query param persistence of filters (planned for future Option C refactor)
- Refactoring to `resource()` or reactive data fetching (planned for future Option C refactor)
- Any changes to the drawer/dialog components
- Any changes to the appointment service or API layer
- Any visual/design changes beyond the structural fix

## Approach

1. **Template restructure**: Move the `filters-bar` div and `view-toggle` div OUTSIDE the `@if (loading())` block, so they are always in the DOM and never destroyed during loading cycles.

2. **Loading state isolation**: Only the data display area (stats row, appointments list/calendar, empty state) should be inside the `@if (loading())` conditional. The spinner replaces only the data area, not the filters.

3. **p-datepicker fix**: Replace `[(ngModel)]="filterDate"` with `[ngModel]="filterDate()" (onSelect)="onDateSelect($event)" (onClear)="onDateClear()" [ngModelOptions]="{standalone: true}"` per the project's documented workaround for the PrimeNG + OnPush bug.

4. **Debounce on dropdowns**: Add a debounce mechanism to filter changes similar to the existing `onSearch()` debounce, to prevent rapid API calls when switching filters quickly.

5. **Guard against re-trigger**: Ensure that when PrimeNG components re-render (e.g., after `loading` toggles), they do NOT emit `ngModelChange` events that would trigger another `resetAndLoad()`.

## Risk Assessment

- **Low risk**: The changes are localized to one component's template and TypeScript. No service changes, no routing changes, no data model changes.
- **Potential issue**: Moving filters outside `@if` means they're visible during initial load before data exists. This is actually desirable UX — users can see and interact with filters while data loads.
- **Potential issue**: The `p-select` components also use `[(ngModel)]`. While they don't have the same documented bug as `p-datepicker`, we should verify they don't emit spurious `ngModelChange` events on re-render. If they do, we'll apply the same standalone pattern.
