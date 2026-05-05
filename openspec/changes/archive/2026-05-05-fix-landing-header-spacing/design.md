# Design: Landing Header Spacing

## Layout Changes

### HTML Structure
Wrap `desktop-nav` and `auth-buttons` inside a new `.header-right` container.

### Spacing System
Apply the project's CSS custom properties consistently:

| Element | Token | Value | Rationale |
|---------|-------|-------|-----------|
| Nav items (between links) | `--space-lg` | 24px | Tight grouping for 6 items |
| Nav group to auth buttons | `--space-2xl` | 48px | Clear separation between info and action |
| Auth buttons (between) | `--space-md` | 16px | Compact, related actions |

### Visual Hierarchy
- Logo remains left-aligned as primary anchor
- Nav + auth grouped right as secondary/action cluster
- Mobile layout unchanged

### Responsive
- `.header-right` only visible at `min-width: 1024px`
- Mobile menu trigger unchanged
