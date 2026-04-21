## ADDED Requirements

### Requirement: Brand name display SHALL be "holacitas" in all lowercase

The system SHALL display the brand name as "holacitas" (all lowercase) in all user-facing text, logos, and metadata. No instance of "CitasYa", "CITASYA", or "citasya" SHALL remain in production code.

#### Scenario: Brand name in page copy
- **WHEN** a user views any page (home, about, FAQ, pricing, login, dashboard)
- **THEN** all references to the brand appear as "holacitas" in lowercase

#### Scenario: Brand name in page title
- **WHEN** a user views the browser tab title
- **THEN** the title reads "holacitas - Gestiona tus citas profesionales"

### Requirement: Logo SVG SHALL display "holacitas" in sage green and ".app" in warm gray

All inline SVG logos SHALL render "holacitas" in sage green (`#9DC183`) and ".app" in warm gray (`#5D6D7E`), both in lowercase, using the Fraunces serif font.

#### Scenario: Desktop header logo
- **WHEN** a user views the landing page header on desktop
- **THEN** the logo displays "holacitas" in green and ".app" in gray, properly sized for 160x44 viewport

#### Scenario: Mobile sidebar logo
- **WHEN** a user opens the mobile drawer in any layout
- **THEN** the logo displays "holacitas" in green and ".app" in gray, properly sized for smaller viewport

#### Scenario: Footer logo
- **WHEN** a user scrolls to the landing page footer
- **THEN** the logo displays "holacitas" in green and ".app" in gray

### Requirement: Favicon SHALL display a calendar icon with brand colors

The favicon SHALL display a minimalist calendar icon using the brand sage green (`#9DC183`) background with white calendar elements and a green dot indicating a booked appointment.

#### Scenario: Browser tab favicon
- **WHEN** a user views the browser tab
- **THEN** a calendar icon with green background is visible and distinguishable at 16x16px

#### Scenario: Bookmark favicon
- **WHEN** a user bookmarks the page
- **THEN** the calendar icon is visible in the bookmarks bar

### Requirement: Contact email domains SHALL use holacitas.app

All email links and contact information SHALL reference `@holacitas.app` domain instead of `@citasya.app`.

#### Scenario: Support email on unauthorized page
- **WHEN** a user views the unauthorized (403) page
- **THEN** the support email link points to `soporte@holacitas.app`

#### Scenario: Contact email on contact page
- **WHEN** a user views the contact page
- **THEN** the contact email displays `hola@holacitas.app`
