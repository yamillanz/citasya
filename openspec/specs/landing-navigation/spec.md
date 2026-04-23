# landing-navigation Specification

## Purpose
TBD - created by archiving change fixes-layout-header. Update Purpose after archive.
## Requirements
### Requirement: Consistent Landing Header Presence
The system SHALL render the `LandingHeaderComponent` on every public-facing landing page.

#### Scenario: Header visible on all landing pages
- **WHEN** user navigates to `/`, `/pricing`, `/about`, `/contact`, or `/faq`
- **THEN** the landing header SHALL be visible at the top of the page
- **AND** the header SHALL remain fixed during scroll

### Requirement: Visual Balance and Alignment
The system SHALL ensure the landing header and page content share consistent horizontal boundaries.

#### Scenario: Header and content alignment
- **WHEN** user views any landing page on desktop viewport (≥1024px)
- **THEN** the header container SHALL have a `max-width` of `1200px`
- **AND** the page content containers SHALL align horizontally with the header edges
- **AND** there SHALL be no horizontal offset between header content and page content

#### Scenario: Hero container width
- **WHEN** user views the home page hero section
- **THEN** the hero container SHALL expand to fill the full available width up to `1200px`
- **AND** it SHALL not shrink due to flex container constraints

### Requirement: Decluttered Navigation
The system SHALL limit the top-level navigation to essential items only.

#### Scenario: Top-level navigation items
- **WHEN** user views the landing header
- **THEN** the navigation SHALL display at most 5 top-level items
- **AND** the item list SHALL be: Inicio, Funciones, Precios, Sobre Nosotros, Contacto
- **AND** `FAQ` SHALL NOT appear in the top-level navigation

### Requirement: Active Page Indicator
The system SHALL provide clear visual indication of the user's current page in the navigation.

#### Scenario: Active link styling
- **WHEN** user is on a specific landing page
- **THEN** the corresponding navigation link SHALL display an `active` CSS class
- **AND** the active link SHALL render with `font-weight: 600` and `color: #5D6D7E`

#### Scenario: Hash-based navigation handling
- **WHEN** user is on the home page (`/`) and navigates to a hash fragment (e.g., `/#features`)
- **THEN** the `Inicio` link SHALL remain marked as active
- **AND** no other navigation link SHALL be marked as active

### Requirement: Keyboard Accessibility
The system SHALL support keyboard navigation and focus management in the landing header.

#### Scenario: Skip-to-content link
- **WHEN** user presses `Tab` immediately after page load
- **THEN** a "Saltar al contenido" link SHALL become visible
- **AND** activating the link SHALL move focus to the `main-content` region
- **AND** the link SHALL be visually hidden until focused

#### Scenario: Visible focus indicators
- **WHEN** user navigates the header via keyboard (`Tab` / `Shift+Tab`)
- **THEN** focusable elements (logo, nav links, auth buttons) SHALL display a visible focus ring
- **AND** the focus ring SHALL use the brand color `#9DC183` with a `2px` solid outline and `2px` offset
- **AND** the focus ring SHALL only appear on `:focus-visible` (not on mouse click)

### Requirement: Responsive Mobile Menu
The system SHALL provide a mobile-friendly navigation experience on small viewports.

#### Scenario: Mobile menu trigger visibility
- **WHEN** viewport width is less than `1024px`
- **THEN** a hamburger menu button SHALL be visible
- **AND** the desktop navigation links SHALL be hidden
- **AND** when viewport is `1024px` or greater, the hamburger button SHALL be completely hidden with no residual layout impact

#### Scenario: Mobile drawer navigation
- **WHEN** user taps the hamburger menu button
- **THEN** a slide-in drawer SHALL appear from the right
- **AND** the drawer SHALL contain all navigation links and auth buttons
- **AND** the active page link SHALL be visually indicated within the drawer

