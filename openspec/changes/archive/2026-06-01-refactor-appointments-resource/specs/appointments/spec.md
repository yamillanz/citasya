## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: Date picker uses signal-based event binding
**Reason**: This requirement describes implementation details (specific PrimeNG event handler pattern) rather than user-visible behavior. The behavior is preserved in the new reactive `resource()`-based implementation.
**Migration**: Not applicable. The `p-datepicker` continues to use `[ngModel]` (one-way) with `(onSelect)` and `(onClear)` event handlers and `[ngModelOptions]="{standalone: true}"`. The filter changes now trigger refetch declaratively through `filterParams` instead of calling `resetAndLoad()`.

### Requirement: Dropdown filters use one-way binding with onChange
**Reason**: This requirement describes implementation details (specific PrimeNG event handler pattern) rather than user-visible behavior. The behavior is preserved in the new reactive `resource()`-based implementation.
**Migration**: Not applicable. The `p-select` components continue to use `[ngModel]` (one-way) with `(onChange)` event handlers. The filter changes now trigger refetch declaratively through `filterParams`.
