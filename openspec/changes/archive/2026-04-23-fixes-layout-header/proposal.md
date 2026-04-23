## Why

The landing page header (`landing-header.component`) has accumulated multiple visual, accessibility, and consistency issues that degrade the first impression of the CitasYa brand. These include misaligned content containers, a cluttered navigation with 6 top-level items, missing accessibility affordances (skip links, focus states, active page indicators), and inconsistent presence across landing pages.

## What Changes

- **Visual Balance**: Increase logo size from `36px` to `42px` and weight from `600` to `700` to establish stronger brand presence.
- **Layout Alignment**: Standardize header and content `max-width` to `1200px`; fix hero container `width: 100%` to prevent flex-item shrink; remove horizontal padding from header container to achieve pixel-perfect alignment with page content.
- **Navigation Clutter**: Remove `FAQ` from top-level header navigation (reducing from 6 to 5 items), decluttering the primary nav.
- **Accessibility**: Add skip-to-content link; implement precise active-page indicator for navigation items; add `id="main-content"` to all 5 landing pages.
- **Cross-Page Consistency**: Add `LandingHeaderComponent` to `pricing`, `about`, `contact`, and `faq` pages (previously only `home` had it).
- **Polish**: Add `:focus-visible` rings to logo, nav links, and auth buttons.

## Capabilities

### New Capabilities
- `landing-navigation`: Unified landing page header with accessible navigation, active state management, and consistent presence across all public-facing landing pages.

### Modified Capabilities
- `ui-consistency`: Extends consistency requirements from backoffice to include landing page header alignment and container width standards (no spec-level behavior changes, implementation-only).

## Impact

- Affected files:
  - `src/app/shared/components/landing-header/*`
  - `src/app/features/landing/home/*`
  - `src/app/features/landing/pricing/*`
  - `src/app/features/landing/about/*`
  - `src/app/features/landing/contact/*`
  - `src/app/features/landing/faq/*`
- No API or dependency changes.
- No breaking changes.
