## MODIFIED Requirements

### Requirement: Appointment status change drawer styling
The system SHALL display the status update drawer with visual styles consistent with the application design system, including proper background, header styling, form inputs, and action buttons.

#### Scenario: Drawer opens with correct styling
- **WHEN** user clicks an action button that opens the status drawer
- **THEN** the drawer displays with:
  - Background color matching the application warm-white palette
  - Header with icon badge, title typography using Fraunces font, and subtitle
  - Proper padding and borders
  - Form inputs with brand focus states
  - Footer buttons aligned to the design system

#### Scenario: Completed appointment amount input is styled
- **WHEN** user opens the drawer to complete an appointment
- **THEN** the amount input displays with:
  - Currency symbol badge with sage palette
  - Input field with standard border-radius and focus ring
  - Consistent spacing and typography

#### Scenario: Cancel/no-show confirmation is styled
- **WHEN** user opens the drawer to cancel or mark no-show
- **THEN** the confirmation message displays with:
  - Warning icon centered and sized appropriately
  - Readable text with proper color contrast
  - Adequate padding and spacing
