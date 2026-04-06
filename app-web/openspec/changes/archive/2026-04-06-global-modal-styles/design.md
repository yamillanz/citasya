# Design: Global PrimeNG Dialog Overrides

## Approach

Add a new CSS section to the global `styles.scss` file that overrides PrimeNG's default dialog styles using the project's existing design tokens. This ensures all dialogs (current and future) automatically adopt the CitasYa design system without per‑component modifications.

## Implementation Details

### 1. Add Missing Design Token

**File:** `src/styles.scss`  
**Location:** Inside the `:root` block (after `--color-sand`).  
**Change:** Add `--color-border: #E8E4DD;` (same value as `--color-sand`).  
**Rationale:** Several components already reference `var(--color-border)`, but it was not defined globally, leading to potential fallback values. Defining it centrally ensures consistency.

### 2. Global PrimeNG Dialog Overrides

**File:** `src/styles.scss`  
**Location:** After the existing "Mobile‑First Responsive" section (end of file).  
**Structure:** Create a new section titled `/* PrimeNG Dialog Overrides */` with the following rules:

| Selector | Properties (using design tokens) |
|----------|----------------------------------|
| `.p-dialog-mask` | `background: rgba(44, 62, 80, 0.5);` |
| `.p-dialog` | `background: var(--color-warm-white); border-radius: var(--radius-lg); box-shadow: var(--shadow-xl); overflow: hidden;` |
| `.p-dialog-header` | `background: var(--color-linen); border-bottom: 1px solid var(--color-border); padding: var(--space-md) var(--space-lg);` |
| `.p-dialog-header .p-dialog-title` | `font-family: var(--font-display); font-size: 1.25rem; font-weight: 600; color: var(--color-text-primary);` |
| `.p-dialog-header-icons` | `color: var(--color-text-secondary);` |
| `.p-dialog-header-icons button:hover` | `color: var(--color-text-primary);` |
| `.p-dialog-content` | `padding: var(--space-lg);` |
| `.p-dialog-footer` | `border-top: 1px solid var(--color-border); padding: var(--space-md) var(--space-lg);` |

**Responsive adjustments:**  
Add a media query for `@media (max-width: 640px)` that sets `.p-dialog` width to `100vw`.

### 3. Conflict Resolution

Existing component‑level dialog styles (e.g., `.appointment-dialog` in `employee-calendar.component.scss`) may still apply due to `:host ::ng-deep`. These can be removed in a future cleanup, but they currently only affect header background and border, which will be overridden by the more specific global rules (since they are loaded later). No immediate action required.

## Files to Modify

1. `src/styles.scss` – add token and dialog overrides.

## Verification

- Open the app and trigger any modal (employee calendar, appointment detail, superadmin dialogs).
- Inspect the dialog elements in browser DevTools to verify the new CSS rules are applied.
- Check that the overlay, header, content, footer, and close button match the design tokens.
- Test on mobile viewport (640px) to ensure responsive behavior.

## Risks

- **Specificity conflicts:** Global styles may be overridden by component‑scoped styles that use `::ng-deep` with higher specificity. Mitigation: ensure global overrides are loaded after component styles (they are, because `styles.scss` is imported last). If conflicts persist, we can increase specificity by adding `html body` prefix or using `!important` (last resort).
- **PrimeNG version changes:** Future PrimeNG updates may change class names or structure. Mitigation: the overrides target stable BEM‑like classes that have been consistent across PrimeNG v20+.
- **Other PrimeNG components:** The overrides are scoped to `.p-dialog` and its children, so they won't affect other components.

## Alternatives Considered

1. **Create a custom PrimeNG theme** – more complex, requires maintaining a full theme file; overkill for just dialog styling.
2. **Use PrimeNG's built‑in theming API** – still requires overriding CSS variables, but we already have our own design tokens.
3. **Keep per‑component styles** – leads to inconsistency and duplicated effort.

## Decision

Proceed with global CSS overrides because it aligns with the existing design system, is simple to implement, and provides immediate consistency across the application.