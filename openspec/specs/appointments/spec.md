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

The appointments list view SHALL load appointments incrementally in batches of 10 as the user scrolls down, triggered by an Intersection Observer on a sentinel element. Exactly one sentinel element SHALL be rendered, placed after the last appointment card (outside the per-appointment `@for` loop), and only while no initial/reload fetch is in progress.

#### Scenario: Initial load of first batch

- **GIVEN** a company has 35 appointments
- **WHEN** the appointments list page loads
- **THEN** only the first 10 appointments are rendered
- **AND** a single sentinel element is present at the bottom of the list, after the last appointment card

#### Scenario: Scroll triggers next batch

- **GIVEN** the first 10 appointments are displayed and `hasMore` is true
- **WHEN** the user scrolls down and the sentinel element becomes visible
- **THEN** the next 10 appointments are fetched and appended to the list
- **AND** `totalCount` remains 35

#### Scenario: All items loaded

- **GIVEN** all 35 appointments have been loaded (`hasMore` is false)
- **WHEN** the user scrolls to the bottom
- **THEN** the sentinel element is not rendered
- **AND** a single end-of-list message "No hay más citas" is displayed once, after the last appointment card

#### Scenario: Sentinel is unique and outside the per-appointment loop

- **GIVEN** 10 appointments are displayed in list view and `hasMore` is true
- **WHEN** the template is rendered
- **THEN** exactly one `#sentinel` element exists in the DOM
- **AND** the incremental loading indicator and the end-of-list message each appear at most once, after the last appointment card (never inside an appointment card)

#### Scenario: Sentinel hidden during resource reload

- **GIVEN** `appointmentsResource.isLoading()` is true (initial load or filter change)
- **WHEN** the list view renders
- **THEN** the sentinel element is not rendered

### Requirement: Loading States

The component SHALL display appropriate loading indicators for initial load, incremental load, empty state, and error state, derived from a `showLoading` computed signal that covers both auth init and resource loading.

#### Scenario: Initial loading spinner
- **GIVEN** the page is loading for the first time (or after a filter change)
- **WHEN** `showLoading` is true
- **THEN** a full-page loading spinner is displayed in the data content area (existing behavior preserved)

#### Scenario: Filter-triggered loading
- **GIVEN** the user changes a filter
- **WHEN** `appointmentsResource.isLoading()` becomes true
- **THEN** `showLoading` returns true
- **AND** the data content area shows a loading spinner

#### Scenario: Incremental loading indicator
- **GIVEN** the user scrolls to load more items
- **WHEN** `loadingMore` is true
- **THEN** a smaller loading indicator appears at the bottom of the list (not blocking existing content)

#### Scenario: Empty state
- **GIVEN** a company has 0 appointments (or filters return 0 results)
- **WHEN** `showLoading` is false and `accumulatedAppointments` is empty
- **THEN** the empty state component is displayed (existing behavior preserved)

#### Scenario: Error state with retry
- **GIVEN** the `appointmentsResource` has an error (e.g., network failure)
- **WHEN** `appointmentsResource.error()` is truthy
- **THEN** an error state component is displayed with an error icon, message "No se pudieron cargar las citas", and a "Reintentar" button
- **WHEN** the user clicks the "Reintentar" button
- **THEN** `appointmentsResource.reload()` is called
- **AND** a new fetch attempt is made

### Requirement: Server-Side Filtering

Filter changes SHALL trigger a fresh fetch from the server with the new filter criteria applied, declaratively driven by Angular's `resource()` primitive. A `filterParams` computed SHALL be the single source of truth that maps filter signals to API parameters.

#### Scenario: Status filter triggers refetch
- **GIVEN** the user has loaded 3 pages (30 appointments) with no filters
- **WHEN** the user selects a status filter (e.g., "pending")
- **THEN** the `filterStatus` signal changes
- **AND** the `filterParams` computed recomputes with the new status
- **AND** `appointmentsResource` auto-reloads with the new params
- **AND** `accumulatedAppointments` is replaced with the new page 0 results
- **AND** the scroll position resets to the top of the list

#### Scenario: Search triggers debounced refetch
- **GIVEN** the user types a search query
- **WHEN** the user stops typing for 300ms
- **THEN** the page resets and fetches appointments matching the search query
- **AND** `debouncedSearchQuery` is the source for the search param

#### Scenario: Clear filters triggers refetch
- **GIVEN** the user clears all filters
- **WHEN** no filters are active
- **THEN** the page resets and fetches all appointments starting from page 0
- **AND** `filterEmployee`, `filterDate`, `filterStatus`, `searchQuery`, and `debouncedSearchQuery` are all cleared

#### Scenario: Filter change cancels in-flight request
- **GIVEN** a fetch is in flight with filter A
- **WHEN** the user changes to filter B before the fetch completes
- **THEN** `resource()` internally aborts the first request
- **AND** only the new request (with filter B) is applied to the UI

### Requirement: Error Handling

Errors during the initial load SHALL be displayed as a dedicated error state in the template, derived from `appointmentsResource.error()`. Errors during incremental load (`loadMore`) SHALL preserve existing data and notify the user via a toast message.

#### Scenario: Initial load fails shows error state
- **GIVEN** the user is on the appointments page and `appointmentsResource` rejects
- **WHEN** `appointmentsResource.error()` becomes truthy
- **THEN** the error state component is displayed (replacing the loading state)
- **AND** the user can click "Reintentar" to retry the load
- **AND** no existing data is shown (since the resource failed)

#### Scenario: Load more fails gracefully
- **GIVEN** 20 appointments are already loaded and displayed
- **WHEN** `loadMore()` is triggered but the network request fails
- **THEN** the existing 20 appointments remain visible
- **AND** a toast error message is displayed: "No se pudieron cargar más citas"
- **AND** `loadingMore` is set to false
- **AND** the sentinel remains visible for retry on next scroll

### Requirement: Race Condition Prevention

Concurrent or rapid scroll events SHALL NOT trigger duplicate fetches. Filter changes during an in-flight `loadMore` SHALL invalidate the stale `loadMore` result. Only one incremental load SHALL be in-flight at a time.

#### Scenario: Duplicate load prevented
- **GIVEN** `loadMore()` is already fetching data (`loadingMore` is true)
- **WHEN** the sentinel fires again (e.g., rapid scrolling)
- **THEN** the second trigger is ignored (guarded by `loadingMore` signal)

#### Scenario: Filter change during loadMore invalidates stale result
- **GIVEN** `loadMore()` is in flight (captured `filterGeneration` is N)
- **WHEN** the user changes a filter, triggering the resource effect, which increments `filterGeneration` to N+1
- **AND** the `loadMore` request resolves
- **THEN** the result is discarded (gen N !== current N+1)
- **AND** the data from the resource effect (with the new filter) is preserved

#### Scenario: loadMore blocked by resource reload
- **GIVEN** `appointmentsResource.isLoading()` is true (initial or filter change)
- **WHEN** the sentinel fires
- **THEN** `loadMore()` is not called (guarded by `appointmentsResource.isLoading()` check)

### Requirement: Calendar View Compatibility

The calendar view tab SHALL continue to function using the same accumulated data source, displaying whatever appointments have been loaded so far. Grouping and sorting for the calendar view SHALL NOT mutate the accumulated appointments array held by the list state.

#### Scenario: Calendar shows loaded data

- **GIVEN** 10 appointments have been loaded in list view
- **WHEN** the user switches to the calendar view tab
- **THEN** those 10 appointments are displayed grouped by date

#### Scenario: Calendar reflects new loads

- **GIVEN** the user loads 10 more appointments in list view (20 total)
- **WHEN** the user switches to calendar view
- **THEN** all 20 appointments are displayed grouped by date

#### Scenario: Grouping does not mutate list state

- **GIVEN** appointments are loaded in list view
- **WHEN** `groupedAppointments` recomputes (e.g., switching to calendar view)
- **THEN** the order and identity of the `accumulatedAppointments` array remain unchanged

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

### Requirement: Filter changes are debounced

The search input SHALL have a debounce of 300ms before triggering a refetch. Other filter signals (employee, date, status) SHALL trigger refetches immediately via the `resource()` reactivity, without a manual debounce.

#### Scenario: User rapidly changes search text
- **GIVEN** the user types a search query character by character
- **WHEN** the user stops typing for 300ms
- **THEN** `debouncedSearchQuery` is updated
- **AND** `appointmentsResource` auto-reloads with the new search term
- **AND** only one refetch is made (not one per keystroke)

#### Scenario: User rapidly changes multiple non-search filters
- **GIVEN** the user changes the status filter
- **AND** within 200ms changes the employee filter
- **WHEN** the resource effect runs after each change
- **THEN** the most recent filter values are applied
- **AND** `resource()` internally aborts the in-flight request from the first filter change

### Requirement: Loading spinner placement in appointments list
The loading spinner SHALL replace only the data content area (stats + cards/list/calendar + empty state), not the filters bar. During loading, the filters bar SHALL be visible but dimmed (opacity 0.6, pointer-events none) to indicate data is refreshing.

#### Scenario: Filters bar shows loading state
- **GIVEN** data is being fetched (`loading` is true)
- **WHEN** the user views the filters bar
- **THEN** the filters bar is visible but dimmed (opacity 0.6, pointer-events none)
- **AND** the data content area shows a loading spinner with "Cargando citas..." text

