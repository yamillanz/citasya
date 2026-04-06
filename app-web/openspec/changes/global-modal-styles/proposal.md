# Proposal: Global PrimeNG Dialog Styling

## Goal

Apply consistent, polished styling to all PrimeNG dialog (`p-dialog`) components across the CitasYa application, ensuring they match the project's design system (sage green palette, warm neutrals, proper padding/margins). This will be a global CSS override that applies to every modal—current and future—without requiring per‑component style adjustments.

## Rationale

- **Current state:** Modals appear with plain white backgrounds, inconsistent spacing, and no cohesive visual language (see attached screenshot). They lack padding, margin, and alignment, making the UI look unfinished.
- **User impact:** Users perceive the application as unprofessional and may experience difficulty reading content inside modals.
- **Developer impact:** Every new modal would require manual styling, leading to inconsistency and wasted effort.
- **Design system:** The project already has a comprehensive set of CSS custom properties (design tokens) for colors, spacing, typography, shadows, etc. These tokens should be leveraged to style PrimeNG dialogs automatically.

## Scope

1. **Add missing design token** `--color-border` to the global `:root` CSS variables.
2. **Create global CSS overrides** for PrimeNG dialog classes (`.p-dialog`, `.p-dialog-header`, `.p-dialog-content`, `.p-dialog-footer`, `.p-dialog-mask`, etc.) using existing design tokens.
3. **Remove or adjust any local dialog styles** that conflict with the new global overrides (optional, can be done later).
4. **Test** that all existing modals adopt the new styling without visual regressions.

## Out of Scope

- Customizing other PrimeNG components (buttons, cards, etc.) – these are already styled appropriately.
- Creating a full PrimeNG theme – we only need to override specific dialog classes.
- Changing the modal layout or content structure – only visual styling.

## Success Criteria

- All modals have a consistent warm‑white background, rounded corners, subtle shadow, and proper padding.
- Header, content, and footer sections are visually separated with borders and spacing.
- Close button is styled consistently.
- Overlay is semi‑transparent dark.
- No console errors or visual glitches introduced.
- Existing component‑level dialog styles are either removed or made compatible with the global overrides.