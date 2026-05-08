# booking-form Specification (Delta)

## Purpose

Add layout polish, responsive behavior, and double-submit prevention requirements to the existing booking-form specification.

## ADDED Requirements

### ADDED Requirement: Double-submit prevention

The booking form SHALL prevent duplicate appointment creation from rapid submit clicks.

#### Scenario: Parent loading guard
- **WHEN** the parent component receives a submit event
- **THEN** it checks the `loading()` signal before processing
- **AND** ignores the event if already loading

#### Scenario: Child submission guard
- **WHEN** the contact form step emits a submit event
- **THEN** it sets an internal `isSubmitting` flag
- **AND** prevents subsequent emits until the flag resets (after 1 second)

### ADDED Requirement: Responsive layout

The booking form SHALL adapt its layout across mobile, tablet, and desktop viewports.

#### Scenario: Mobile viewport (≤480px)
- **WHEN** the viewport width is 480px or less
- **THEN** progress steps stack vertically
- **AND** form actions use full-width buttons
- **AND** card padding reduces to `var(--space-lg)`

#### Scenario: Tablet viewport (≤640px)
- **WHEN** the viewport width is 640px or less
- **THEN** selection content padding reduces
- **AND** action button spacing adjusts

#### Scenario: Desktop viewport (>640px)
- **WHEN** the viewport width exceeds 640px
- **THEN** step content is centered with max-width of 600px
- **AND** full padding and spacing applies

### ADDED Requirement: Design token compliance

All booking form styles SHALL use CSS custom properties from the design system.

#### Scenario: Color usage
- **WHEN** any color is used in booking form styles
- **THEN** it references a CSS variable (`--color-sage`, `--color-text-secondary`, etc.)
- **AND** no hardcoded hex values are present

#### Scenario: Spacing usage
- **WHEN** any spacing is used in booking form styles
- **THEN** it references a CSS variable (`--space-xs`, `--space-md`, etc.)
- **AND** no hardcoded pixel values are present

### ADDED Requirement: Component style encapsulation

Each step sub-component SHALL define its own `.step-card` and `.card-header` styles.

#### Scenario: Self-contained styles
- **WHEN** a step component renders
- **THEN** its card and header styles are defined in its own SCSS file
- **AND** not dependent on parent component styles (View Encapsulation compliance)

### ADDED Requirement: Initial loading indicator

The booking form SHALL display a loading state while fetching initial appointment data.

#### Scenario: Show loading spinner
- **WHEN** `initialLoading()` is true
- **THEN** a progress spinner is centered on screen
- **AND** step content is hidden

#### Scenario: Transition to first step
- **WHEN** `initialLoading()` becomes false
- **THEN** the spinner fades out
- **AND** the first step content renders
