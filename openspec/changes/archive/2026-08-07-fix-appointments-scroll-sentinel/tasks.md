# Tasks: Fix appointments scroll sentinel placement

## 1. Template fix (`appointments.component.html`)

- [x] 1.1 Remove the `loading-more`, `#sentinel`, and `end-of-list` blocks from inside `.appointment-card` / the `@for` loop
- [x] 1.2 Re-insert them once, after the `@for` closes, at the end of `.appointments-list`
- [x] 1.3 Change the sentinel condition to `@if (hasMore() && !appointmentsResource.isLoading())`

## 2. Computed fix (`appointments.component.ts`)

- [x] 2.1 Change `groupedAppointments` to sort a copy: `[...this.filteredAppointments()].sort(...)`

## 3. Tests (`appointments.component.spec.ts`)

- [x] 3.1 Add/adjust test: exactly one `.scroll-sentinel` is rendered and it is not inside an `.appointment-card`
- [x] 3.2 Add/adjust test: `end-of-list` message renders at most once when `hasMore` is false
- [x] 3.3 Add/adjust test: `groupedAppointments` does not mutate `accumulatedAppointments` order/identity

## 4. Verification

- [x] 4.1 Component spec passes (`appointments.component.spec.ts`) — 68/68 tests green
- [x] 4.2 Build passes (`ng build`) — only pre-existing CommonJS warnings (canvg/jspdf)
- [x] 4.3 Manual check: initial load does NOT auto-trigger `loadMore`; scrolling to the bottom loads the next batch once; spinner and "No hay más citas" appear once at the bottom
