# Spec: Appointments List Lazy Loading

## ADDED Requirements

### REQ-ALZ-001: Server-Side Paginated Fetch

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

**Scenarios:**

- **Given** a company has 25 appointments
- **When** `getByCompanyPaginated({ companyId, page: 0, pageSize: 10 })` is called
- **Then** it returns 10 appointments, `totalCount: 25`, `hasMore: true`

- **Given** a company has 25 appointments
- **When** `getByCompanyPaginated({ companyId, page: 2, pageSize: 10 })` is called
- **Then** it returns 5 appointments, `totalCount: 25`, `hasMore: false`

- **Given** a company has appointments with mixed statuses
- **When** `getByCompanyPaginated({ companyId, page: 0, pageSize: 10, status: 'pending' })` is called
- **Then** it returns only pending appointments, with `totalCount` reflecting only matching records

- **Given** a company has appointments, and a search query "Juan" is provided
- **When** `getByCompanyPaginated({ companyId, page: 0, pageSize: 10, search: 'Juan' })` is called
- **Then** it returns only appointments where `client_name` contains "Juan" (case-insensitive)

- **Given** the Supabase query fails
- **When** `getByCompanyPaginated()` is called
- **Then** it throws the error to be handled by the caller

### REQ-ALZ-002: Lazy Loading on List View

The appointments list view SHALL load appointments incrementally in batches of 10 as the user scrolls down, triggered by an Intersection Observer on a sentinel element.

**Scenarios:**

- **Given** a company has 35 appointments
- **When** the appointments list page loads
- **Then** only the first 10 appointments are rendered
- **And** a sentinel element is present at the bottom of the list

- **Given** the first 10 appointments are displayed and `hasMore` is true
- **When** the user scrolls down and the sentinel element becomes visible
- **Then** the next 10 appointments are fetched and appended to the list
- **And** `totalCount` remains 35

- **Given** all 35 appointments have been loaded (`hasMore` is false)
- **When** the user scrolls to the bottom
- **Then** the sentinel element is not rendered
- **And** an end-of-list message "No hay más citas" is displayed

### REQ-ALZ-003: Loading States

The component SHALL display appropriate loading indicators for initial load, incremental load, and empty state.

**Scenarios:**

- **Given** the page is loading for the first time (or after a filter change)
- **When** `loading` is true
- **Then** a full-page loading spinner is displayed (existing behavior preserved)

- **Given** the user scrolls to load more items
- **When** `loadingMore` is true
- **Then** a smaller loading indicator appears at the bottom of the list (not blocking existing content)

- **Given** a company has 0 appointments (or filters return 0 results)
- **When** `loading` is false and `accumulatedAppointments` is empty
- **Then** the empty state component is displayed (existing behavior preserved)

### REQ-ALZ-004: Server-Side Filtering

Filter changes SHALL trigger a full reset of paginated data and a fresh fetch from the server with the new filter criteria applied.

**Scenarios:**

- **Given** the user has loaded 3 pages (30 appointments) with no filters
- **When** the user selects a status filter (e.g., "pending")
- **Then** the page resets to page 0
- **And** `accumulatedAppointments` is cleared
- **And** a fresh fetch loads appointments filtered by status
- **And** the scroll position resets to the top of the list

- **Given** the user types a search query
- **When** the user stops typing for 300ms
- **Then** the page resets and fetches appointments matching the search query

- **Given** the user clears all filters
- **When** no filters are active
- **Then** the page resets and fetches all appointments starting from page 0

### REQ-ALZ-005: Error Handling

Errors during lazy loading SHALL not clear existing data and SHALL notify the user via a toast message.

**Scenarios:**

- **Given** 20 appointments are already loaded and displayed
- **When** `loadMore()` is triggered but the network request fails
- **Then** the existing 20 appointments remain visible
- **And** a toast error message is displayed: "No se pudieron cargar más citas"
- **And** `loadingMore` is set to false
- **And** the sentinel remains visible for retry on next scroll

- **Given** a filter change triggers `resetAndLoad()` and the request fails
- **When** the error occurs
- **Then** a toast error message is displayed
- **And** `loading` is set to false
- **And** the previous data (if any) is preserved (not cleared)

### REQ-ALZ-006: Race Condition Prevention

Concurrent or rapid scroll events SHALL NOT trigger duplicate fetches. Only one incremental load SHALL be in-flight at a time.

**Scenarios:**

- **Given** `loadMore()` is already fetching data (`loadingMore` is true)
- **When** the sentinel fires again (e.g., rapid scrolling)
- **Then** the second trigger is ignored (guarded by `loadingMore` signal)

### REQ-ALZ-007: Calendar View Compatibility

The calendar view tab SHALL continue to function using the same accumulated data source, displaying whatever appointments have been loaded so far.

**Scenarios:**

- **Given** 10 appointments have been loaded in list view
- **When** the user switches to the calendar view tab
- **Then** those 10 appointments are displayed grouped by date

- **Given** the user loads 10 more appointments in list view (20 total)
- **When** the user switches to calendar view
- **Then** all 20 appointments are displayed grouped by date

## MODIFIED Requirements

### REQ-ALZ-008: Filter Behavior (Modified)

**Previously**: Filters applied client-side to the entire dataset loaded in memory.

**Now**: Filters SHALL be applied server-side via the paginated query. Filter changes SHALL trigger a reset to page 0 and a fresh fetch.

This affects: `filterEmployee`, `filterDate`, `filterStatus`, and `searchQuery`.

## REMOVED Requirements

(None)
