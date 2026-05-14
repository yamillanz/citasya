# Delta Specs: Appointments Filter Reload Fix

## ADDED Requirements

### Requirement: Filters bar persists during loading
The filters bar (search input, date picker, employee select, status select, view toggle) SHALL remain rendered in the DOM at all times, regardless of the `loading` signal state. Only the data content area (stats, appointment cards/list, calendar view, empty state) SHALL be replaced by a loading spinner when `loading()` is true.

#### Scenario: User selects status filter
- **GIVEN** the appointments page is loaded with data
- **WHEN** the user selects "Pendiente" from the status dropdown
- **THEN** `resetAndLoad()` is triggered and `loading` becomes true
- **AND** the filters bar remains visible in the DOM (not destroyed)
- **AND** the data area shows a loading spinner
- **WHEN** the API response arrives and `loading` becomes false
- **THEN** the data area shows the filtered results
- **AND** the status dropdown still shows "Pendiente" selected

#### Scenario: Initial page load
- **GIVEN** the user navigates to `/bo/appointments`
- **WHEN** the page starts loading
- **THEN** the header and filters bar are visible immediately
- **AND** a loading spinner appears in the data content area
- **WHEN** data finishes loading
- **THEN** the data content area shows the appointments list
- **AND** the filters bar was never destroyed or recreated

### Requirement: Date picker uses signal-based event binding
The `p-datepicker` for date filtering SHALL use `[ngModel]` (one-way) with `(onSelect)` and `(onClear)` event handlers instead of `[(ngModel)]` (two-way binding), with `[ngModelOptions]="{standalone: true}"`.

#### Scenario: User picks a date filter
- **GIVEN** the appointments page is loaded
- **WHEN** the user selects a date in the date picker
- **THEN** `onDateSelect()` is called with the selected Date
- **AND** `filterDate` signal is updated to the selected date
- **AND** `resetAndLoad()` is called with the new filter value
- **AND** the date picker continues showing the selected date after loading completes

#### Scenario: User clears the date filter
- **GIVEN** the user has a date filter active
- **WHEN** the user clicks the clear button on the date picker
- **THEN** `onDateClear()` is called
- **AND** `filterDate` signal is set to null
- **AND** `resetAndLoad()` is called with no date filter

### Requirement: Dropdown filters use one-way binding with onChange
The `p-select` components for employee and status filters SHALL use `[ngModel]` (one-way) with `(onChange)` event handlers and `[ngModelOptions]="{standalone: true}"` to prevent spurious `ngModelChange` emissions during re-render.

#### Scenario: Employee dropdown re-renders after loading
- **GIVEN** the user has selected an employee filter
- **WHEN** the data finishes loading and the view updates
- **THEN** the employee dropdown still shows the selected employee
- **AND** no spurious `resetAndLoad()` is triggered with an empty value

### Requirement: Filter changes are debounced
All filter change handlers (employee, status, date) SHALL have a debounce of 300ms before triggering `resetAndLoad()`. The search input debounce of 300ms SHALL be preserved.

#### Scenario: User rapidly changes multiple filters
- **GIVEN** the user changes the status filter
- **AND** within 200ms changes the employee filter
- **WHEN** the debounce timer fires after 300ms from the last change
- **THEN** only ONE `resetAndLoad()` call is made with both filter values applied
- **AND** no intermediate API call is made with only the first filter

### Requirement: Loading spinner placement in appointments list
The loading spinner SHALL replace only the data content area (stats + cards/list/calendar + empty state), not the filters bar. During loading, the filters bar SHALL be visible but dimmed (opacity 0.6, pointer-events none) to indicate data is refreshing.

#### Scenario: Filters bar shows loading state
- **GIVEN** data is being fetched (`loading` is true)
- **WHEN** the user views the filters bar
- **THEN** the filters bar is visible but dimmed (opacity 0.6, pointer-events none)
- **AND** the data content area shows a loading spinner with "Cargando citas..." text
