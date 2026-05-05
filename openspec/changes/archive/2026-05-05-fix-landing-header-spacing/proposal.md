# Fix Landing Header Spacing

## Problem
After adding the "Aliados" link to the landing page header, the navigation items felt too spread out and the auth buttons were disconnected from the nav group. The `space-between` distribution with 6 nav items created an unbalanced, stretched appearance.

## Solution
Restructure the header layout to group the desktop navigation and auth buttons into a single `.header-right` container. Adjust spacing tokens to create intentional visual rhythm:

- Nav items gap: 32px → 24px (tighter grouping)
- Nav-to-auth separation: 48px (clear but generous)
- Auth buttons gap: 16px (maintained)

## Scope
- `app-web/src/app/shared/components/landing-header/landing-header.component.html`
- `app-web/src/app/shared/components/landing-header/landing-header.component.scss`

## Impact
Improved visual hierarchy and grouping in the landing page header on desktop (≥1024px).
