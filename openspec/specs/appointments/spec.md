# appointments Specification

## Purpose
TBD - created by archiving change add-appointments-lazy-loading. Update Purpose after archive.
## Requirements
### Requirement: Server-Side Paginated Fetch

The `AppointmentService` SHALL provide a `getByCompanyPaginated()` method that retrieves appointments in paginated batches with optional server-side filters.

**Parameters:**
- `companyId` (required): UUID of the company
- `page` (required): Zero-based page index
- `pageSize` (required): Number of items per page
- `status` (optional): Filter by appointment status (`pending`, `completed`, `cancelled`, `no_show`, or `all`)
- `employeeId` (optional): Filter by employee UUID
- `date` (optional): Filter by appointment date (YYYY-MM-DD)
- `search` (optional): Case-insensitive partial match on `client_name`

**Returns:**
- `data`: Array of `Appointment` objects for the requested page
- `totalCount`: Total number of records matching the filters
- `hasMore`: Boolean indicating if more pages exist beyond the current one

#### Scenario: First page of 25 appointments

- **GIVEN** a company has 25 appointments
- **WHEN** `getByCompanyPaginated({ companyId, page: 0, pageSize: 10 })` is called
- **THEN** it returns 10 appointments, `totalCount: 25`, `hasMore: true`

#### Scenario: Last incomplete page

- **GIVEN** a company has 25 appointments
- **WHEN** `getByCompanyPaginated({ companyId, page: 2, pageSize: 10 })` is called
- **THEN** it returns 5 appointments, `totalCount: 25`, `hasMore: false`

#### Scenario: Status filter

- **GIVEN** a company has appointments with mixed statuses
- **WHEN** `getByCompanyPaginated({ companyId, page: 0, pageSize: 10, status: 'pending' })` is called
- **THEN** it returns only pending appointments, with `totalCount` reflecting only matching records

#### Scenario: Search filter

- **GIVEN** a company has appointments, and a search query "Juan" is provided
- **WHEN** `getByCompanyPaginated({ companyId, page: 0, pageSize: 10, search: 'Juan' })` is called
- **THEN** it returns only appointments where `client_name` contains "Juan" (case-insensitive)

#### Scenario: Query failure

- **GIVEN** the Supabase query fails
- **WHEN** `getByCompanyPaginated()` is called
- **THEN** it throws the error to be handled by the caller

### Requirement: Lazy Loading on List View

The appointments list view SHALL load appointments incrementally in batches of 10 as the user scrolls down, triggered by an Intersection Observer on a sentinel element.

#### Scenario: Initial load of first batch

- **GIVEN** a company has 35 appointments
- **WHEN** the appointments list page loads
- **THEN** only the first 10 appointments are rendered
- **AND** a sentinel element is present at the bottom of the list

#### Scenario: Scroll triggers next batch

- **GIVEN** the first 10 appointments are displayed and `hasMore` is true
- **WHEN** the user scrolls down and the sentinel element becomes visible
- **THEN** the next 10 appointments are fetched and appended to the list
- **AND** `totalCount` remains 35

#### Scenario: All items loaded

- **GIVEN** all 35 appointments have been loaded (`hasMore` is false)
- **WHEN** the user scrolls to the bottom
- **THEN** the sentinel element is not rendered
- **AND** an end-of-list message "No hay más citas" is displayed

### Requirement: Loading States

The component SHALL display appropriate loading indicators for initial load, incremental load, and empty state.

#### Scenario: Initial loading spinner

- **GIVEN** the page is loading for the first time (or after a filter change)
- **WHEN** `loading` is true
- **THEN** a full-page loading spinner is displayed (existing behavior preserved)

#### Scenario: Incremental loading indicator

- **GIVEN** the user scrolls to load more items
- **WHEN** `loadingMore` is true
- **THEN** a smaller loading indicator appears at the bottom of the list (not blocking existing content)

#### Scenario: Empty state

- **GIVEN** a company has 0 appointments (or filters return 0 results)
- **WHEN** `loading` is false and `accumulatedAppointments` is empty
- **THEN** the empty state component is displayed (existing behavior preserved)

### Requirement: Server-Side Filtering

Filter changes SHALL trigger a full reset of paginated data and a fresh fetch from the server with the new filter criteria applied.

#### Scenario: Status filter triggers reset

- **GIVEN** the user has loaded 3 pages (30 appointments) with no filters
- **WHEN** the user selects a status filter (e.g., "pending")
- **THEN** the page resets to page 0
- **AND** `accumulatedAppointments` is cleared
- **AND** a fresh fetch loads appointments filtered by status
- **AND** the scroll position resets to the top of the list

#### Scenario: Search triggers debounced reset

- **GIVEN** the user types a search query
- **WHEN** the user stops typing for 300ms
- **THEN** the page resets and fetches appointments matching the search query

#### Scenario: Clear filters triggers reset

- **GIVEN** the user clears all filters
- **WHEN** no filters are active
- **THEN** the page resets and fetches all appointments starting from page 0

### Requirement: Error Handling

Errors during lazy loading SHALL not clear existing data and SHALL notify the user via a toast message.

#### Scenario: Load more fails gracefully

- **GIVEN** 20 appointments are already loaded and displayed
- **WHEN** `loadMore()` is triggered but the network request fails
- **THEN** the existing 20 appointments remain visible
- **AND** a toast error message is displayed: "No se pudieron cargar más citas"
- **AND** `loadingMore` is set to false
- **AND** the sentinel remains visible for retry on next scroll

#### Scenario: Reset fails preserves data

- **GIVEN** a filter change triggers `resetAndLoad()` and the request fails
- **WHEN** the error occurs
- **THEN** a toast error message is displayed
- **AND** `loading` is set to false
- **AND** the previous data (if any) is preserved (not cleared)

### Requirement: Race Condition Prevention

Concurrent or rapid scroll events SHALL NOT trigger duplicate fetches. Only one incremental load SHALL be in-flight at a time.

#### Scenario: Duplicate load prevented

- **GIVEN** `loadMore()` is already fetching data (`loadingMore` is true)
- **WHEN** the sentinel fires again (e.g., rapid scrolling)
- **THEN** the second trigger is ignored (guarded by `loadingMore` signal)

### Requirement: Calendar View Compatibility

The calendar view tab SHALL continue to function using the same accumulated data source, displaying whatever appointments have been loaded so far.

#### Scenario: Calendar shows loaded data

- **GIVEN** 10 appointments have been loaded in list view
- **WHEN** the user switches to the calendar view tab
- **THEN** those 10 appointments are displayed grouped by date

#### Scenario: Calendar reflects new loads

- **GIVEN** the user loads 10 more appointments in list view (20 total)
- **WHEN** the user switches to calendar view
- **THEN** all 20 appointments are displayed grouped by date

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

