# Proposal: Fix appointments scroll sentinel placement

## Why

The infinite-scroll sentinel, the incremental loading indicator, and the end-of-list message in the manager appointments list are rendered **inside** the `@for` loop, inside each `.appointment-card` (`appointments.component.html`). This breaks the "Lazy Loading on List View" requirement of the `appointments` spec:

- With N appointment cards there are N `#sentinel` elements; `viewChild('sentinel')` captures only the **first**, so the IntersectionObserver watches the first card instead of the bottom of the list. `loadMore()` fires immediately on initial load and re-fires whenever the first card re-enters the viewport — not when the user reaches the bottom.
- The "Cargando más citas..." spinner renders once per card instead of once at the bottom.
- The "No hay más citas" end-of-list message renders inside every card when `hasMore()` is false.

Additionally, `groupedAppointments` sorts the array held by the `accumulatedAppointments` signal **in place** (`.sort()` mutates), which is a signal-state mutation anti-pattern that can produce inconsistent renders between list and calendar views.

## What Changes

- Move the `loading-more`, `#sentinel`, and `end-of-list` blocks out of the `@for` loop so they render exactly once, at the end of `.appointments-list`.
- Align the sentinel render condition with the planned design: render only when `hasMore() && !appointmentsResource.isLoading()`.
- Fix `groupedAppointments` to sort a copy (`[...arr].sort()`) instead of mutating the signal's array in place.
- Strengthen the `appointments` spec so the single-sentinel placement and grouping immutability are explicit requirements.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `appointments`: Strengthen "Lazy Loading on List View" — exactly one sentinel/loading/end-of-list element, rendered once outside the per-appointment loop. Strengthen "Calendar View Compatibility" — grouping must not mutate the accumulated list.

## Impact

- `app-web/src/app/features/backoffice/manager/appointments/appointments.component.html` — template structure fix.
- `app-web/src/app/features/backoffice/manager/appointments/appointments.component.ts` — `groupedAppointments` computed.
- `app-web/src/app/features/backoffice/manager/appointments/appointments.component.spec.ts` — tests covering the fixes.
- No service, API, or dependency changes. No breaking changes.
