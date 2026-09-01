## Context

The manager settings page (`/bo/settings`, `settings.component.*`) renders 7 schedule rows as a 4-column grid: day name, toggle, start time, end time. At ≤480px the CSS adds a responsive rule that maps **both** `.col-time` elements (start and end) to the same grid cell (`grid-row: 2; grid-column: 1 / -1`), so the two time inputs overlap and only one is visible. The `.time-error` element keeps `grid-column: 3 / -1` from the desktop rule, creating an implicit column outside the 2-column mobile grid, so the validation message overflows off-viewport. The header row with "Apertura"/"Cierre" is hidden at ≤480px, leaving time inputs unlabeled and unnoticed.

Current data flow is unchanged and correct: `daySchedules` signal holds `{day_of_week, is_active, start_time, end_time, id}`; times are `HH:mm` strings backed by native `input type="time"`.

## Goals / Non-Goals

**Goals:**
- Make each mobile schedule day usable: visible and editable start + end time inputs.
- Show "Apertura"/"Cierre" captions on mobile since the header row is hidden.
- Keep the time error message inside the row and on-screen on mobile.
- Add accessible labels (aria-label) for each time input.

**Non-Goals:**
- Not replacing `input type="time"` with PrimeNG pickers (no PrimeNG time-only component exists; `p-datepicker [timeOnly]` would add 14 overlays and the known OnPush double-click bug for worse UX in a settings grid).
- No changes to logic, validation, persistence, or the ScheduleService API.
- No redesign of desktop (≥769px) or tablet (481–768px) layouts beyond fixing the error overflow.
- No changes to the existing "Hora inválida" toast at submit.
- No test-suite overhaul; only the touched behavior is validated by existing tests if present.

## Decisions

### Decision 1: CSS-first fix of the mobile grid (no DOM restructuring at ≤480px)

Fix `.schedule-row` at ≤480px by giving the two `.col-time` wrappers explicit distinct placement and captions via CSS only:
- `.col-time:nth-of-type(...)` or wrapping both inputs in a dedicated `.time-pair` container in the template with `grid-column: 1 / -1` at row 2; inside it, a 2-column grid (or flex) of `Apertura`/`Cierre` labeled fields.
- Rationale: matches the existing template structure, keeps diff minimal, avoids touching component logic.
- Alternative considered: reordering the DOM into a per-day card structure in the template for all breakpoints — rejected: larger diff, desktop layout is already correct.

### Decision 2: Captions via small labels in the template

Add a `<label>` + `aria-label` (e.g. `aria-label="Lunes, hora de apertura"`) to each time input. Captions render at all sizes but are visually hidden on desktop (where the header row shows the column names), visible on mobile.
- Rationale: single source in the template; accessible on every viewport without duplicating text.
- Alternative considered: CSS-generated content — rejected (not accessible, hard to localize).

### Decision 3: Fix mobile `.time-error`

Override `.time-error` grid placement inside the ≤480px media query to fall within the day row (e.g., `grid-column: 1 / -1; grid-row: auto;`), so it appears below the time inputs inside the visible grid.
- Rationale: removes implicit off-grid columns created by the desktop `grid-column: 3 / -1`.

## Risks / Trade-offs

- [CSS overlap regressions from future layout changes] → Keep desktop and tablet breakpoints untouched; only override the ≤480px media block. Verify via manual responsive check (Chrome DevTools 375px) and the existing visual pattern.
- [Native time input rendering differs across mobile browsers (iOS shows "8:00 p.m." in the wheel)] → Acceptable: it is the project convention (same input used in the booking flow) and provides the native picker UX on phones.
- [Busy-schedule data with `start >= end` shows the error row, changing row height] → Expected: error is inside the row (`.time-error` stays inline within the day's flow), no layout break.

## Migration Plan

1. Apply template/scss changes.
2. Manual responsive verification at 375px (Chrome DevTools): toggling days, editing both times, triggering invalid range error, saving.
3. Run existing frontend tests (`npm test` if configured) — no API/schema change, no data migration, no rollback risk beyond `git revert` of the two files.
