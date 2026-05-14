# Delta Specs: Appointments Filter Reload Fix

## ADDED Requirements

### REQ-01: Filters Bar Must Persist During Loading
- The filters bar (search input, date picker, employee select, status select, view toggle) SHALL remain rendered in the DOM at all times, regardless of the `loading` signal state.
- When `loading()` is `true`, only the data content area (stats, appointment cards/list, calendar view, empty state) SHALL be replaced by a loading spinner.
- The filters bar SHALL NOT be inside any conditional block (`@if`/`@else`) that depends on `loading`.

**Scenario**: User selects "Pendiente" status filter
- Given the appointments page is loaded with data
- When the user selects "Pendiente" from the status dropdown
- Then `onFilterChange()` is called, which triggers `resetAndLoad()`
- And `loading` becomes `true`
- And the filters bar remains visible and interactive (NOT destroyed)
- And the data area shows a loading spinner
- When the API response arrives and `loading` becomes `false`
- Then the data area shows the filtered results
- And the status dropdown still shows "Pendiente" selected
- And no second `resetAndLoad()` is triggered with empty filters

### REQ-02: Date Picker Must Use Signal-Based Pattern
- The `p-datepicker` for date filtering SHALL use `[ngModel]` (one-way) with `(onSelect)` and `(onClear)` event handlers instead of `[(ngModel)]` (two-way binding).
- The `p-datepicker` SHALL use `[ngModelOptions]="{standalone: true}"` to avoid conflicts with any form group.
- When a date is selected, `onDateSelect(date: Date)` SHALL set `filterDate` signal and call `resetAndLoad()`.
- When the date is cleared, `onDateClear()` SHALL set `filterDate` to `null` and call `resetAndLoad()`.

**Scenario**: User picks a date filter
- Given the appointments page is loaded
- When the user selects a date in the date picker
- Then `onDateSelect()` is called with the selected Date
- And `filterDate` signal is updated to the selected date
- And `resetAndLoad()` is called with the new filter value
- And the date picker continues showing the selected date after loading completes

**Scenario**: User clears the date filter
- Given the user has a date filter active
- When the user clicks the clear button on the date picker
- Then `onDateClear()` is called
- And `filterDate` signal is set to `null`
- And `resetAndLoad()` is called with no date filter

### REQ-03: Dropdown Filters Must Not Trigger Spurious Reloads
- The `p-select` components for employee and status filters SHALL NOT emit `ngModelChange` events when they are re-rendered or when their parent view is updated.
- If `[(ngModel)]` on `p-select` causes spurious `ngModelChange` emissions during re-render, the component SHALL be migrated to `[ngModel]` (one-way) with `(onChange)` event handler and `[ngModelOptions]="{standalone: true}"`.

**Scenario**: Employee dropdown re-renders after loading
- Given the user has selected an employee filter
- When the data finishes loading and the view updates
- Then the employee dropdown SHALL still show the selected employee
- And `onFilterChange()` SHALL NOT be called again with an empty value

### REQ-04: Filter Changes Must Be Debounced
- All filter change handlers (employee, status, date) SHALL have a debounce of at least 300ms before triggering `resetAndLoad()`.
- The search input already has 300ms debounce; this SHALL be preserved.
- Debounce prevents rapid successive API calls when the user changes multiple filters quickly.

**Scenario**: User rapidly changes multiple filters
- Given the user changes the status filter
- And within 200ms changes the employee filter
- When the debounce timer fires after 300ms from the last change
- Then only ONE `resetAndLoad()` call is made with both filter values applied
- And no intermediate API call is made with only the first filter

## MODIFIED Requirements

### REQ-MOD-01: Loading Spinner Placement
- Previously: The loading spinner replaced the ENTIRE content below the header (filters + data).
- Now: The loading spinner replaces ONLY the data content area (stats + cards/list/calendar + empty state).
- The filters bar is always visible, even during initial page load.

**Scenario**: Initial page load
- Given the user navigates to `/bo/appointments`
- When the page starts loading
- Then the header and filters bar are visible immediately
- And a loading spinner appears in the data content area
- When data finishes loading
- Then the data content area shows the appointments list
- And the filters bar was never destroyed or recreated