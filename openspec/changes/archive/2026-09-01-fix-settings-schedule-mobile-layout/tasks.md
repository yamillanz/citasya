# Task List

## 1. Template updates

- [x] 1.1 Wrap the two `.col-time` inputs per day in a `.time-pair` container in `settings.component.html`
- [x] 1.2 Add "Apertura" caption/label for the start time input
- [x] 1.3 Add "Cierre" caption/label for the end time input
- [x] 1.4 Add `aria-label` (e.g., "Lunes, hora de apertura") to each time input

## 2. Mobile styles

- [x] 2.1 Update `settings.component.scss` ≤480px block: `.time-pair` occupies the full second row (no shared grid cell between start/end)
- [x] 2.2 Stack time inputs vertically on mobile (Apertura then Cierre, each full-width) with captions visible; no overlap or right-edge overflow
- [x] 2.3 Override `.time-error` at ≤480px to render inside the day row (no off-viewport implicit columns)
- [x] 2.4 Ensure desktop (≥769px) and tablet (481–768px) layouts are unaffected; visually hide captions there

## 3. Verification

- [ ] 3.1 Manual responsive check at 375px: both times visible and editable per active day
- [ ] 3.2 Manual check: inactive day shows dimmed disabled inputs without overlap
- [ ] 3.3 Manual check: invalid range (start >= end) shows "Hora inválida" inside the row on mobile
- [x] 3.4 Run frontend tests (existing suite) and confirm no regressions
