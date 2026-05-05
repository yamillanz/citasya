# Spec: Landing Header Spacing

## Requirement: Header right-side grouping
The landing header SHALL group desktop navigation and auth buttons into a single right-aligned container with consistent spacing.

### Acceptance Criteria
1. `desktop-nav` and `auth-buttons` are wrapped in `.header-right`
2. `.header-right` uses `display: flex` with `gap: var(--space-2xl)`
3. `.desktop-nav` uses `gap: var(--space-lg)`
4. `.auth-buttons` uses `gap: var(--space-md)`
5. `.header-right` is hidden below 1024px
6. Mobile layout and drawer remain unchanged
