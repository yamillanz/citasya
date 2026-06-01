## 1. Additive signals and computed properties

- [x] 1.1 Add `resource` to the `@angular/core` imports in `appointments.component.ts`
- [x] 1.2 Add `debouncedSearchQuery` signal (mirrors `searchQuery` with 300ms debounce)
- [x] 1.3 Add `private filterGeneration` signal (counter for race condition prevention)
- [x] 1.4 Add `private formatFilterDate()` helper method (formats Date to YYYY-MM-DD)
- [x] 1.5 Add `filterParams` computed (single source of truth for API params)
- [x] 1.6 Add `showLoading` computed (covers auth init + resource loading)

## 2. Appointments resource

- [x] 2.1 Add `appointmentsResource = resource({...})` that reads `filterParams()` and fetches page 0
- [x] 2.2 Add sync effect in constructor that mirrors `appointmentsResource.value()` to `accumulatedAppointments`, `totalCount`, `hasMore`, `currentPage`, `loadingMore`, and `filterGeneration`

## 3. Employees resource

- [x] 3.1 Add `employeesResource = resource({...})` that fetches employees by company on `companyId()` change
- [x] 3.2 Update `employeeOptions` computed to derive from `employeesResource.value() ?? []`
- [x] 3.3 Remove `employees = signal<User[]>([])` field

## 4. Remove imperative data fetching

- [x] 4.1 Remove `loading = signal(true)` field
- [x] 4.2 Remove `private filterTimeout?: ReturnType<typeof setTimeout>` field
- [x] 4.3 Remove `resetAndLoad()` method
- [x] 4.4 Remove `loadInitialData()` method
- [x] 4.5 Remove `debouncedFilterChange()` method
- [x] 4.6 Update `ngOnInit()` — remove `loadInitialData()` call and `loading.set(false)`; resources auto-start with `companyId`
- [x] 4.7 Update `refreshData()` — call `appointmentsResource.reload()` instead of `resetAndLoad()`
- [x] 4.8 Update `handleAppointmentCreated()` — call `appointmentsResource.reload()` instead of `resetAndLoad()`
- [x] 4.9 Update `loadMore()` — change `this.loading()` guard to `this.appointmentsResource.isLoading()`; add `filterGeneration` guard
- [x] 4.10 Update `IntersectionObserver` callback — use `appointmentsResource.isLoading()` instead of `loading()`
- [x] 4.11 Update `ngOnDestroy()` — remove `filterTimeout` cleanup
- [x] 4.12 Update `clearFilters()` — clear `debouncedSearchQuery` and remove `resetAndLoad()` call
- [x] 4.13 Update `onSearch()` — set `debouncedSearchQuery` after 300ms instead of calling `resetAndLoad()`
- [x] 4.14 Simplify filter handlers (`onDateSelect`, `onDateClear`, `onEmployeeChange`, `onStatusChange`) — remove `debouncedFilterChange()` calls (resource auto-reloads via `filterParams`)

## 5. Template updates

- [x] 5.1 Update refresh button binding: `[loading]="loading()"` → `[loading]="appointmentsResource.isLoading()"`
- [x] 5.2 Update filters bar loading class: `[class.loading]="loading()"` → `[class.loading]="showLoading()"`
- [x] 5.3 Update main loading branch: `@if (loading())` → `@if (showLoading())`
- [x] 5.4 Add error state branch: `@else if (appointmentsResource.error())` with retry button bound to `appointmentsResource.reload()`
- [x] 5.5 Update create dialog employees binding: `[employees]="employees()"` → `[employees]="employeesResource.value() ?? []"`

## 6. Styles

- [x] 6.1 Add `.error-state` styles to `appointments.component.scss` (flex column, centered, error icon color)

## 7. Test updates

- [x] 7.1 Update `createMock()` — remove `employees` and `loading` signals, add `employeesResourceValue`, `debouncedSearchQuery`, `filterGeneration`, `companyId`, `resourceIsLoading`, `resourceError`, `filterParams`, `showLoading`, `formatFilterDate`
- [x] 7.2 Update `createMock()` — remove `resetAndLoad`, `resetAndLoadCalls`, `loadMoreCalls`, `onFilterChange`; update `loadMore` guards; update `clearFilters` to clear `debouncedSearchQuery`
- [x] 7.3 Update mock return statement — remove obsolete fields, add new ones
- [x] 7.4 Replace `resetAndLoad` test block with `filterParams` test block (8 scenarios covering companyId/status/employeeId/search/date)
- [x] 7.5 Update `loadMore` test block — replace `loading`/`loadMoreCalls` checks with `resourceIsLoading`/`currentPage` checks (5 scenarios)
- [x] 7.6 Remove `onFilterChange` test block
- [x] 7.7 Update `clearFilters` test — verify `debouncedSearchQuery` is also cleared
- [x] 7.8 Update `opciones de empleados` tests — use `employeesResourceValue` instead of `employees`

## 8. Verification

- [x] 8.1 Run `ng build` — succeeds with no new errors/warnings
- [x] 8.2 Run unit tests for `appointments.component.spec` — 65/65 tests pass
