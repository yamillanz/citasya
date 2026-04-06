# Implementation Tasks

## Pre‑requisites

- [x] Create OpenSpec change directory (`global-modal-styles`).
- [x] Write proposal, specs, and design artifacts.

## Implementation

### 1. Add missing design token

- [x] Open `src/styles.scss`.
- [x] Locate the `:root` block (line 12‑75).
- [x] Add `--color-border: #E8E4DD;` after `--color-sand` (around line 23).
- [x] Save the file.

### 2. Create global PrimeNG dialog overrides

- [x] Still in `src/styles.scss`, scroll to the end of the file (after the "Mobile‑First Responsive" section).
- [x] Add a new comment section: `/* PrimeNG Dialog Overrides */`.
- [x] Add the CSS rules as described in the design document, using the design tokens.
- [x] Include the responsive media query for mobile.
- [x] Save the file.

### 3. Verify the changes

- [ ] Run the development server (`ng serve`).
- [ ] Open the public booking page and trigger the appointment details modal (click on an appointment).
- [ ] Inspect the modal using browser DevTools to confirm the new styles are applied.
- [ ] Test the following modals:
  - Employee calendar appointment details (public).
  - Appointment detail dialog (backoffice employee history).
  - Superadmin dialogs (plans, users, companies).
- [ ] Check mobile viewport (resize browser to ≤640px) to ensure responsive behavior.
- [ ] Ensure no visual regressions in other PrimeNG components (buttons, cards, tables, etc.).

### 4. Clean up (optional)

- [ ] If any existing component‑level dialog styles conflict with the new global styles, remove or adjust them.
  - Example: `.appointment-dialog` in `employee-calendar.component.scss` (lines 126‑143).
- [ ] This step can be deferred to a future cleanup if time is limited.

## Verification Checklist

- [ ] Dialog background is warm‑white (`var(--color-warm-white)`).
- [ ] Dialog has rounded corners (`var(--radius-lg)`).
- [ ] Dialog has box‑shadow (`var(--shadow-xl)`).
- [ ] Header background is linen (`var(--color-linen)`).
- [ ] Header has bottom border (`var(--color-border)`).
- [ ] Header title uses correct font, size, and weight.
- [ ] Content has proper padding (`var(--space-lg)`).
- [ ] Footer has top border and padding.
- [ ] Overlay is semi‑transparent dark.
- [ ] Close button icon color changes on hover.
- [ ] On mobile, dialog width is `100vw`.
- [ ] No console errors related to CSS.
- [ ] All existing modals look consistent.

## Rollback Plan

If the changes cause unexpected issues:

1. Revert the changes to `src/styles.scss` (remove the added token and dialog overrides).
2. Restart the development server.
3. If the issue persists, check for cached CSS by doing a hard refresh (`Ctrl+Shift+R`).