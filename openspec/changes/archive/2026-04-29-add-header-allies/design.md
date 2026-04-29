# Design: add-header-allies

## Changes

### allies.page.ts
- Import `LandingHeaderComponent` from `../../../shared/components/landing-header/landing-header.component`
- Add `LandingHeaderComponent` to the `imports` array

### allies.page.html
- Add `<app-landing-header />` as the first element inside the `.allies-page` div (before the hero section)

## Rationale
- Follows the exact same pattern as all other landing pages (home, pricing, contact, faq, about)
- `LandingHeaderComponent` is a shared standalone component, no additional setup needed
- The component already includes "Aliados" in its navigation items, so the link to the current page will be highlighted correctly
