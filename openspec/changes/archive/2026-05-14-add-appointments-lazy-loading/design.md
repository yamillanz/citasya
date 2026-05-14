# Design: Lazy Loading for Appointments List

## Architecture Overview

```
AppointmentsComponent (list view)
    │
    ├── IntersectionObserver → sentinel element
    │       │
    │       └── triggers loadMore() when visible
    │
    ├── AppointmentService.getByCompanyPaginated()
    │       │
    │       └── Supabase .range(start, end) + { count: 'exact' }
    │
    └── Signals: accumulatedAppointments, hasMore, loadingMore, totalCount
```

## Data Flow

### Initial Load
1. Component initializes → `resetAndLoad()` called
2. Fetches employees (full list, once) + first 10 appointments with filters
3. `accumulatedAppointments` set to first batch
4. `totalCount` and `hasMore` derived from Supabase count

### Scroll → Load More
1. Sentinel element becomes visible (Intersection Observer)
2. Guard checks: `hasMore() && !loadingMore() && !loading()`
3. `loadMore()` increments page, fetches next 10
4. Results appended to `accumulatedAppointments`
5. `hasMore` recalculated based on count

### Filter Change
1. Any filter signal changes → `effect()` triggers `resetAndLoad()`
2. Search query uses 300ms debounce before triggering
3. Page reset to 0, accumulated data cleared, fresh fetch
4. Scroll position resets to top

### Error Handling
- Network errors: Toast notification, existing data preserved, `loadingMore` reset
- Empty results: Empty state component shown
- Race conditions: Only latest request results applied (via request token/cancellation)

## State Management (Signals)

| Signal | Type | Purpose |
|--------|------|---------|
| `accumulatedAppointments` | `Signal<Appointment[]>` | All loaded appointments (appended incrementally) |
| `loading` | `Signal<boolean>` | Initial/filter-change loading state |
| `loadingMore` | `Signal<boolean>` | Incremental loading state (prevents double-fire) |
| `hasMore` | `Signal<boolean>` | Whether more records exist on server |
| `totalCount` | `Signal<number>` | Total matching records (from Supabase count) |
| `currentPage` | `Signal<number>` | Current page index (0-based) |
| `pageSize` | `Signal<number>` | Items per page (fixed at 10) |
| `filterEmployee` | `Signal<string>` | Employee filter |
| `filterDate` | `Signal<string>` | Date filter |
| `filterStatus` | `Signal<string>` | Status filter |
| `searchQuery` | `Signal<string>` | Client name search |

### Computed Signals (unchanged from current)
| Signal | Purpose |
|--------|---------|
| `filteredAppointments` | Now returns `accumulatedAppointments()` directly (filtering is server-side) |
| `groupedAppointments` | Groups by date for calendar view (uses `accumulatedAppointments()`) |

## Service API Changes

### New Method: `AppointmentService.getByCompanyPaginated()`

```typescript
interface PaginatedAppointmentOptions {
  companyId: string;
  page: number;
  pageSize: number;
  status?: AppointmentStatus | 'all';
  employeeId?: string;
  date?: string;
  search?: string;
}

interface PaginatedAppointmentResult {
  data: Appointment[];
  totalCount: number;
  hasMore: boolean;
}

async getByCompanyPaginated(options: PaginatedAppointmentOptions): Promise<PaginatedAppointmentResult>
```

**Supabase Query Construction:**
```sql
SELECT *, appointment_services(service:services(*)), employee:employee_id(full_name)
FROM appointments
WHERE company_id = :companyId
  AND (status = :status OR :status IS NULL)
  AND (employee_id = :employeeId OR :employeeId IS NULL)
  AND (appointment_date = :date OR :date IS NULL)
  AND (client_name ILIKE :search OR :search IS NULL)
ORDER BY appointment_date DESC, appointment_time ASC
LIMIT :pageSize OFFSET :start
-- with { count: 'exact' } for total
```

### Existing Method: `getByCompany()` — PRESERVED (used elsewhere potentially)

## Intersection Observer Implementation

```typescript
private observer?: IntersectionObserver;

constructor() {
  this.zone = inject(NgZone);
  // ...
  effect(() => {
    // React to filter changes
    if (/* any filter changed */) this.resetAndLoad();
  });
}

private setupObserver(): void {
  this.zone.runOutsideAngular(() => {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && this.hasMore() && !this.loadingMore()) {
          this.zone.run(() => this.loadMore());
        }
      },
      { rootMargin: '100px' } // Start loading 100px before reaching sentinel
    );
  });
}
```

**Why `NgZone.runOutsideAngular()`**: Prevents excessive change detection cycles from Intersection Observer callbacks.

**Why `rootMargin: '100px'`**: Triggers loading slightly before the user reaches the bottom, providing a smoother experience.

## File Changes

| File | Action | Purpose |
|------|--------|---------|
| `app-web/src/app/core/services/appointment.service.ts` | MODIFY | Add `getByCompanyPaginated()` method |
| `app-web/src/app/features/backoffice/manager/appointments/appointments.component.ts` | MODIFY | Replace single-fetch with lazy loading, add Intersection Observer |
| `app-web/src/app/features/backoffice/manager/appointments/appointments.component.html` | MODIFY | Add sentinel element, loading-more indicator, end-of-list message |
| `app-web/src/app/features/backoffice/manager/appointments/appointments.component.scss` | MODIFY | Styles for sentinel, loading-more spinner, end-message |

## Design Decisions

1. **Server-side pagination over client-side**: Chosen because the primary goal is preventing large data fetches. Client-side pagination would still load all records initially.

2. **Intersection Observer over scroll events**: More performant (browser-native, no debouncing needed), better mobile compatibility, and simpler to implement with `rootMargin`.

3. **Filters moved server-side**: Necessary consequence of lazy loading — we can't filter client-side on incomplete data. This also improves performance for large datasets.

4. **`rootMargin: '100px'`**: Pre-fetching before the user reaches the bottom creates a seamless scrolling experience.

5. **No new dependencies**: Intersection Observer is supported in all modern browsers (including mobile). No need for `ngx-infinite-scroll` or `@angular/cdk`.

6. **Filters reset on change**: When any filter changes, we reset to page 0 and fetch fresh. This is simpler than trying to apply filters to already-loaded data and tracking which pages have been loaded.

7. **Calendar view shares state**: The calendar view tab uses `accumulatedAppointments()` so it shows whatever the list view has loaded. This is acceptable since the user primarily uses the list view.
