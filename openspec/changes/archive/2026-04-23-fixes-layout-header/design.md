## Context

The `LandingHeaderComponent` is the primary navigation element for all public-facing pages (`/`, `/pricing`, `/about`, `/contact`, `/faq`). It was originally built with `max-width: 1280px` while page content used `1200px`, causing a visible horizontal misalignment. The navigation contained 6 top-level items (including `FAQ`), which felt cluttered on medium-width viewports. Accessibility gaps included missing skip links, no active-page indicator, and absent focus states. Only the `home` page included the header; other landing pages rendered without it.

## Goals / Non-Goals

**Goals:**
- Unify header and content horizontal boundaries across all landing pages.
- Reduce top-level navigation cognitive load.
- Meet WCAG AA keyboard accessibility standards for the header.
- Ensure every landing page renders the same header consistently.

**Non-Goals:**
- Redesigning the header visual style (colors, typography, layout structure remain unchanged).
- Adding new pages or routes.
- Modifying backoffice headers or navigation patterns.
- Implementing server-side rendering or SEO changes.

## Decisions

**1. Custom `isActive()` method instead of `routerLinkActive`**
- **Rationale**: Angular's `routerLinkActive` with default `exact: false` marks both `/` and `/#features` as active when on the home page. Custom logic using `Router.url` and exact matching on path (ignoring hash) correctly distinguishes root path from fragment navigation.
- **Alternative considered**: `routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}"` — rejected because it would deactivate `Inicio` when navigating to `/#features`.

**2. Remove `FAQ` from top-level instead of collapsing into dropdown**
- **Rationale**: A dropdown for a single item adds unnecessary interaction complexity. Users can reach FAQ from the footer or home page features section. Keeping 5 items visible preserves scanability without hiding content.
- **Alternative considered**: Converting to a "More" overflow dropdown — rejected as over-engineering for a single page removal.

**3. Header max-width `1200px` to match content containers**
- **Rationale**: The home page hero and other landing content already used varying max-widths around `1200px`. Aligning the header to this value eliminates the visual gap. `1280px` was an outlier.
- **Alternative considered**: Expanding all content to `1280px` — rejected because it would require refactoring every landing page container and potentially break responsive layouts.

**4. Set header-container padding to `0` rather than compensating with page padding**
- **Rationale**: The header inner container had horizontal padding (`var(--space-lg)`) that pushed content inward relative to the page content, which had no outer padding at the container level. Removing padding from the header wrapper achieves exact pixel alignment with zero side effects.
- **Alternative considered**: Adding matching padding to all page containers — rejected because it would introduce unnecessary horizontal whitespace on mobile and require touching every page component.

**5. Hide mobile menu trigger via `.mobile-menu-trigger { display: none }` on the wrapper**
- **Rationale**: The previous implementation hid only the inner button, leaving the wrapper element as a flex item that consumed space and pushed navigation links left, breaking right-edge alignment.
- **Alternative considered**: Using Angular `@if` conditional rendering — rejected to keep the DOM simpler and avoid potential hydration/layout shift issues.

**6. Use `:focus-visible` instead of `:focus`**
- **Rationale**: `:focus-visible` ensures focus rings appear only during keyboard navigation, preventing visual clutter when users click with a mouse.
- **Alternative considered**: Global `:focus` styling — rejected because it creates unwanted outlines on mouse-driven interactions.

## Risks / Trade-offs

- **[Risk]** Removing `FAQ` from top-level navigation may reduce discoverability.
  - **Mitigation**: FAQ remains accessible via footer links and home page sections. Analytics can be monitored for FAQ traffic drop.
- **[Risk]** Header max-width reduction from `1280px` to `1200px` may feel cramped on ultra-wide monitors.
  - **Mitigation**: `1200px` is a standard content width; ample margin remains on 1440px+ screens. No user complaints about content width previously.
- **[Risk]** Active page logic relies on URL string parsing; future query parameter additions may require updates.
  - **Mitigation**: Logic is centralized in a single method; easily extendable to strip query strings if needed.

## Migration Plan

No migration steps required. This is a pure UI/UX change with no data model, API, or routing changes. Deployment is safe to roll forward; rollback involves reverting the 9 modified files.
