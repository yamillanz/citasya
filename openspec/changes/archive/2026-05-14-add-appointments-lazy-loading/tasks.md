# Tasks: Lazy Loading for Appointments List

## Phase 1: Service Layer — Server-Side Pagination

- [x] 1.1 Add `getByCompanyPaginated()` method to `AppointmentService` (`app-web/src/app/core/services/appointment.service.ts`)
  - Accept `PaginatedAppointmentOptions` parameter (companyId, page, pageSize, optional filters)
  - Build Supabase query with conditional `.eq()`, `.ilike()` filters
  - Use `.range(start, end)` for pagination
  - Use `{ count: 'exact' }` option to get total count
  - Return `PaginatedAppointmentResult` with `data`, `totalCount`, `hasMore`
  - Reuse existing `.select()` join pattern and `flattenServices()` transformation
  - Preserve existing `getByCompany()` method unchanged

- [x] 1.2 Add TypeScript interfaces for pagination options and result in `appointment.service.ts` or `appointment.model.ts`
  - `PaginatedAppointmentOptions` interface
  - `PaginatedAppointmentResult` interface

## Phase 2: Component — Lazy Loading Logic

- [x] 2.1 Refactor state signals in `AppointmentsComponent` (`appointments.component.ts`)
  - Rename `appointments` signal to `accumulatedAppointments` (or add as new signal)
  - Add `currentPage = signal(0)`
  - Add `hasMore = signal(true)`
  - Add `loadingMore = signal(false)`
  - Add `totalCount = signal(0)`
  - Keep `pageSize = signal(10)` constant
  - Keep ALL existing filter signals (`filterEmployee`, `filterDate`, `filterStatus`, `searchQuery`)
  - Keep `employees` signal (loaded once, full list)
  - Keep `loading` signal for initial/filter-change state

- [x] 2.2 Update `filteredAppointments` computed signal
  - Return `accumulatedAppointments()` directly (filtering is now server-side)
  - Preserve `groupedAppointments` computed (uses same data source)

- [x] 2.3 Implement `resetAndLoad()` method
  - Reset `currentPage` to 0
  - Clear `accumulatedAppointments`
  - Set `loading` to true
  - Fetch first page with current filters via `getByCompanyPaginated()`
  - Update `accumulatedAppointments`, `totalCount`, `hasMore`
  - Handle errors with toast, keep existing data
  - Set `loading` to false

- [x] 2.4 Implement `loadMore()` method
  - Guard: return if `!hasMore()` or `loadingMore()` or `loading()`
  - Set `loadingMore` to true
  - Increment `currentPage`
  - Fetch next page with current filters via `getByCompanyPaginated()`
  - Append results to `accumulatedAppointments`
  - Update `totalCount`, `hasMore`
  - Handle errors with toast, don't clear existing data
  - Set `loadingMore` to false

- [x] 2.5 Implement filter-change watcher via `effect()`
  - Watch `filterEmployee`, `filterDate`, `filterStatus`
  - On any change → call `resetAndLoad()`
  - For `searchQuery`: use debounced signal (300ms) before triggering reset

- [x] 2.6 Add debounced search
  - Create `debouncedSearch = signal('')` 
  - Use `effect()` with `setTimeout` or a custom debounce utility
  - When `debouncedSearch` changes → trigger `resetAndLoad()`

- [x] 2.7 Implement Intersection Observer setup
  - Inject `NgZone` via `inject(NgZone)`
  - Create `setupObserver()` method called in `ngAfterViewInit()`
  - Use `zone.runOutsideAngular()` around observer creation
  - Observer fires `zone.run(() => this.loadMore())` when sentinel is intersecting
  - Use `rootMargin: '100px'` for pre-fetch
  - Disconnect and recreate observer on filter changes (sentinel may move)

- [x] 2.8 Update `ngOnDestroy()` 
  - Disconnect Intersection Observer
  - Clean up any `effect()` subscriptions if using manual subscription

- [x] 2.9 Update `loadData()` / initialization
  - Call `resetAndLoad()` instead of current `loadData()` logic
  - Keep employee fetching (full list, once) separate — can be parallel with first page

## Phase 3: Template — UI Updates

- [x] 3.1 Add sentinel element to list view (`appointments.component.html`)
  - Add `<div #sentinel class="scroll-sentinel"></div>` at the bottom of the appointment cards loop
  - Only render when `hasMore()` is true
  - Use `@viewChild('sentinel', { static: false })` to get element reference for observer

- [x] 3.2 Add loading-more indicator
  - Show spinner/text when `loadingMore()` is true
  - Example: `<div class="loading-more"><p-progressSpinner *ngIf="loadingMore()"></p-progressSpinner></div>` or simple CSS spinner

- [x] 3.3 Add end-of-list message
  - Show message when `!hasMore()` and `accumulatedAppointments().length > 0`
  - Text: "No hay más citas" or similar

- [x] 3.4 Ensure empty state still works
  - Show empty state component when `!loading() && accumulatedAppointments().length === 0`

- [x] 3.5 Ensure calendar view still works
  - Calendar view tab uses `groupedAppointments` computed (based on `accumulatedAppointments()`)
  - No template changes needed for calendar view

## Phase 4: Styles

- [x] 4.1 Add styles for sentinel element
  - `height: 1px; visibility: hidden;` — invisible trigger element

- [x] 4.2 Add styles for loading-more indicator
  - Follow `STYLES.MD` loading state pattern
  - Center the spinner, adequate padding

- [x] 4.3 Add styles for end-of-list message
  - Subtle text, centered, with some padding

## Phase 5: Testing & Verification

- [x] 5.1 Manual testing — list view
  - Navigate to `/bo/appointments` with a company that has 20+ appointments
  - Verify only 10 load initially
  - Scroll to bottom → verify 10 more load
  - Verify "No hay más citas" appears when all loaded
  - Verify loading spinner appears during fetch

- [x] 5.2 Manual testing — filters
  - Apply status filter → verify reset and reload with filtered results
  - Apply employee filter → verify reset and reload
  - Apply date filter → verify reset and reload
  - Search by client name → verify debounced reset and reload
  - Clear all filters → verify reset and reload with all results

- [x] 5.3 Manual testing — calendar view
  - Switch to calendar tab → verify loaded appointments appear grouped by date
  - Scroll more in list view → switch to calendar → verify new appointments appear

- [x] 5.4 Manual testing — edge cases
  - Company with 0 appointments → verify empty state
  - Company with exactly 10 appointments → verify all load in first batch, no sentinel
  - Company with exactly 11 appointments → verify pagination works at boundary
  - Network error simulation (offline) → verify toast, existing data preserved
  - Fast scrolling → verify no duplicate requests (loadingMore guard)

- [x] 5.5 Write unit/integration tests for `getByCompanyPaginated()`
  - Verify correct `.range()` parameters
  - Verify filter conditions are applied correctly
  - Verify `{ count: 'exact' }` is used
  - Verify `flattenServices` transformation is applied

- [x] 5.6 Write component tests for lazy loading behavior
  - Verify first page loads on init
  - Verify `loadMore` appends data
  - Verify `hasMore` computed correctly
  - Verify filter change resets pagination
  - Verify loading states are set correctly
