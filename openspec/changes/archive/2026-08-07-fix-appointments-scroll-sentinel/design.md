# Design: Fix appointments scroll sentinel placement

## Context

The manager appointments page (`features/backoffice/manager/appointments/`) was recently refactored to a declarative `resource()` architecture (see `PLAN-refactor-appointments-resource.md`). After that refactor, the lazy-loading UI blocks (`loading-more`, `#sentinel`, `end-of-list`) ended up rendered **inside** the `@for` loop that renders each `.appointment-card` (`appointments.component.html`, lines ~303–318).

Consequences:

- N cards → N `#sentinel` elements. `viewChild('sentinel')` captures only the **first** one, so the `IntersectionObserver` (created in the constructor, re-bound via an `effect` on `sentinelEl()`) observes an element inside the first card. `loadMore()` fires immediately on initial load and whenever the first card re-enters the viewport — not when the user reaches the bottom.
- The incremental spinner and end-of-list message are duplicated once per card.

Separately, `groupedAppointments` calls `.sort()` directly on the array reference held by the `accumulatedAppointments` signal, mutating signal state in place — an Angular signals anti-pattern that can make list and calendar views observe inconsistent ordering.

## Goals / Non-Goals

**Goals:**

- Exactly one `#sentinel`, one incremental loading indicator, and one end-of-list message, rendered after the last appointment card in list view.
- Sentinel only rendered when `hasMore() && !appointmentsResource.isLoading()` (aligns with the original refactor plan §6.5).
- `groupedAppointments` computes without mutating `accumulatedAppointments`.
- No behavioral regression in lazy loading, filters, or calendar view.

**Non-Goals:**

- No changes to `AppointmentService`, pagination params, or the `resource()` architecture.
- No redesign of the calendar view or card layout/styles (existing `.loading-more`, `.scroll-sentinel`, `.end-of-list` classes are reused as-is).
- No cleanup of unrelated minor items noted in review (identity `filteredAppointments` computed, unreachable `throw` in loader).

## Decisions

### D1: Move the three blocks outside the `@for`, keep them inside `.appointments-list`

The `loading-more`, `#sentinel`, and `end-of-list` blocks move from inside `.appointment-card` (inside the `@for`) to the end of `.appointments-list`, after the `@for` closes.

- **Why inside `.appointments-list` and not after it**: they are part of the list flow and inherit its layout context; moving them outside the list container would change spacing/layout rules.
- **Alternative considered**: a second `viewChild` query strategy (e.g., `viewChildren` + observe last). Rejected — the correct fix is structural (one sentinel), not a query workaround for duplicated elements.

### D2: Sentinel condition `hasMore() && !appointmentsResource.isLoading()`

The observer callback already guards with `!appointmentsResource.isLoading()`, but not rendering the sentinel at all during a reload avoids observe/disconnect churn on the `sentinelEl()` effect and matches the strengthened spec.

- **Trade-off**: during a filter-change reload the sentinel disappears and reappears; the existing `effect` on `sentinelEl()` already disconnects/re-observes, so this is safe.

### D3: Clone before sorting in `groupedAppointments`

Change `this.filteredAppointments().sort(...)` to `[...this.filteredAppointments()].sort(...)` so the computed works on a copy.

- **Alternative considered**: `toSorted()` — rejected to avoid depending on runtime polyfill/ES2023 support assumptions in the current build target; the spread clone is equivalent and universally safe.

## Risks / Trade-offs

- [Moving the blocks out of the card changes which element wraps the spinner/end message → minor visual shift] → The blocks keep their existing CSS classes; verify list view visually after the change.
- [Sentinel no longer rendered while `isLoading()` → if `hasMore` is true after first page, sentinel re-appears when loading finishes and observer re-attaches] → Covered by the existing `sentinelEl()` effect; validated by scroll test.

## Migration Plan

Pure frontend bug fix, no data or API migration. Deploy with the normal build. Rollback = revert the commit.

## Open Questions

(none)
