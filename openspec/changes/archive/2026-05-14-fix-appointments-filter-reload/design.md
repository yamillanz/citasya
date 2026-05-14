# Design: Fix Appointments Filter Reload

## Architecture Decision

### Problem
The `@if (loading()) { spinner } @else { ENTIRE_UI }` pattern in the template destroys all PrimeNG filter components when `loading` becomes `true`. When recreated, PrimeNG components emit default values through `[(ngModel)]`, overwriting signal-based filter state and triggering an unfiltered `resetAndLoad()`.

### Chosen Approach: Structural Template Fix + Signal-Based Bindings

**Why this approach:**
- Minimal code changes — only the template structure and a few TypeScript methods
- Directly addresses the root cause (DOM destruction of filter controls)
- Follows the project's documented workaround for PrimeNG + OnPush bugs
- No architectural changes to data fetching or state management

**Alternatives considered:**
1. **URL query params for filters** — More robust but overkill for this bug fix. Planned for Option C refactor.
2. **`resource()` reactive data fetching** — Modern Angular pattern but too invasive for a bug fix. Planned for Option C refactor.
3. **`trackBy` or `@defer` to preserve components** — Doesn't solve the root cause; the `@if` still destroys the DOM subtree.

## Data Flow

### Before (broken):
```
User selects filter → ngModelChange → onFilterChange() → resetAndLoad()
  → loading.set(true) → @if destroys ALL UI including filters
  → API call → loading.set(false) → @if recreates ALL UI
  → PrimeNG emits default values via [(ngModel)] → signals reset to empty
  → ngModelChange fires again → onFilterChange() → resetAndLoad() with empty filters
```

### After (fixed):
```
User selects filter → onSelect/onChange → onDateSelect()/onFilterChange()
  → resetAndLoad() → loading.set(true) → @if replaces ONLY data area
  → Filters remain in DOM, signals unchanged
  → API call → loading.set(false) → data area shows filtered results
  → No spurious re-trigger, filters still show selected values
```

## File Changes

### `appointments.component.html`
**Action: MODIFIED**

1. **Move filters outside `@if (loading())`**: The `<div class="filters-bar">` and `<div class="view-toggle">` blocks (lines 40-99) move OUTSIDE the `@else` block, to be siblings of the `@if (loading())` block.

2. **Restructure the conditional**: Change from:
```html
@if (loading()) {
  <spinner>
} @else {
  <filters-bar>
  <stats-row>
  <appointments-list/calendar>
}
```
To:
```html
<filters-bar>  <!-- Always rendered -->
@if (loading()) {
  <spinner>    <!-- Only data area shows spinner -->
} @else {
  <stats-row>
  <appointments-list/calendar>
}
```

3. **Fix p-datepicker binding**: Change from:
```html
<p-datepicker 
  [(ngModel)]="filterDate"
  (ngModelChange)="onFilterChange()"
  ...>
```
To:
```html
<p-datepicker 
  [ngModel]="filterDate()"
  (onSelect)="onDateSelect($event)"
  (onClear)="onDateClear()"
  [ngModelOptions]="{standalone: true}"
  ...>
```

4. **Fix p-select bindings** (if needed): Change from:
```html
<p-select 
  [(ngModel)]="filterEmployee"
  (ngModelChange)="onFilterChange()"
  ...>
```
To:
```html
<p-select 
  [ngModel]="filterEmployee()"
  (onChange)="onEmployeeChange($event)"
  [ngModelOptions]="{standalone: true}"
  ...>
```
Same pattern for `filterStatus`.

5. **Add loading state to filters area**: Show a subtle loading indicator on the filters bar when `loading()` is true, so users know data is refreshing. This can be a disabled state or a small spinner overlay.

### `appointments.component.ts`
**Action: MODIFIED**

1. **Add new methods**:
```typescript
onDateSelect(date: Date) {
  this.filterDate.set(date);
  this.debouncedFilterChange();
}

onDateClear() {
  this.filterDate.set(null);
  this.debouncedFilterChange();
}

onEmployeeChange(event: any) {
  this.filterEmployee.set(event.value ?? '');
  this.debouncedFilterChange();
}

onStatusChange(event: any) {
  this.filterStatus.set(event.value ?? '');
  this.debouncedFilterChange();
}
```

2. **Add debounce mechanism for filter changes**:
```typescript
private filterTimeout?: ReturnType<typeof setTimeout>;

debouncedFilterChange() {
  if (this.filterTimeout) clearTimeout(this.filterTimeout);
  this.filterTimeout = setTimeout(() => {
    this.resetAndLoad();
  }, 300);
}
```

3. **Update `clearFilters()`**: Ensure it also clears the `filterTimeout`:
```typescript
clearFilters() {
  this.filterEmployee.set('');
  this.filterDate.set(null);
  this.filterStatus.set('');
  this.searchQuery.set('');
  if (this.searchTimeout) clearTimeout(this.searchTimeout);
  if (this.filterTimeout) clearTimeout(this.filterTimeout);
  this.resetAndLoad();
}
```

4. **Update `ngOnDestroy()`**: Clear `filterTimeout`:
```typescript
ngOnDestroy() {
  if (this.searchTimeout) clearTimeout(this.searchTimeout);
  if (this.filterTimeout) clearTimeout(this.filterTimeout);
  this.observer?.disconnect();
}
```

5. **Remove `onFilterChange()` method**: Replace all usages with the specific handler methods above. The generic `onFilterChange()` that directly calls `resetAndLoad()` is no longer needed.

### `appointments.component.scss`
**Action: MODIFIED (minor)**

1. Add a subtle loading overlay or disabled state for the filters bar during loading:
```scss
.filters-bar {
  // ... existing styles ...
  
  &.loading {
    opacity: 0.7;
    pointer-events: none;
  }
}
```

Or alternatively, add a small spinner indicator within the filters bar.

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Filter state location | Component signals (unchanged) | Minimal change; URL params planned for Option C |
| Date picker binding | `[ngModel]` + `(onSelect)` + `(onClear)` | Project's documented workaround for PrimeNG + OnPush bug |
| Select bindings | `[ngModel]` + `(onChange)` | Consistent pattern; prevents spurious emissions |
| Debounce strategy | Single `filterTimeout` | Simple; matches existing `searchTimeout` pattern |
| Loading UX for filters | Dimmed + pointer-events:none | Clear visual feedback without destroying components |