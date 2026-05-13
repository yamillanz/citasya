# Proposal: Lazy Loading for Appointments List

## Intent

Replace the current "fetch-all" approach on the `/bo/appointments` list view with a **lazy loading (infinite scroll)** mechanism that loads appointments in batches of 10. This prevents performance degradation as the dataset grows and provides a better mobile scrolling experience.

## Scope

### In
- **Server-side pagination** in `AppointmentService` using Supabase `.range()` and `{ count: 'exact' }`
- **Infinite scroll (lazy load)** on the list view tab of the appointments page
- Batch size of **10 items** per load
- **Loading indicator** at the bottom while fetching more items
- **End-of-list indicator** when all items have been loaded
- **Server-side filtering** (status, employee, date, search) — filters reset and re-trigger paginated fetch
- Debounced search (300ms) to avoid excessive queries
- Graceful error handling — toast on failure, existing data preserved

### Out
- Calendar view — continues showing whatever data has been loaded so far (shared state); no independent lazy loading
- Employee list — still loaded once in full (small dataset needed for filter dropdown)
- No new npm dependencies — uses native Intersection Observer API
- No changes to the appointment detail dialog, status drawer, or payment drawer
- No migration or database schema changes

## Approach

1. **Extend `AppointmentService`** with a new `getByCompanyPaginated()` method that accepts optional filters and uses Supabase's `.range(start, end)` with `{ count: 'exact' }`
2. **Refactor the component** to use accumulated data via signals instead of a single fetch
3. **Implement Intersection Observer** on a sentinel element at the bottom of the list to trigger `loadMore()`
4. **Move filtering server-side** — all filter changes trigger a reset + fresh paginated fetch
5. **Preserve existing UI** — appointment cards, status badges, drawer interactions remain untouched
