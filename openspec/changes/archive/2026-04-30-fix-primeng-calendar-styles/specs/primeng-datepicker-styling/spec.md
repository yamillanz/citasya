## ADDED Requirements

### Requirement: PrimeNG DatePicker global styling
The system MUST apply global styles in `styles.scss` so that all PrimeNG v20 `p-datepicker` components render with the CitasYa color palette and visual design.

#### Scenario: Calendar panel with branded styles
- **WHEN** the user opens the `p-datepicker` dropdown calendar
- **THEN** the panel MUST have a white background (`--color-warm-white`), border (`--color-border`), border-radius (`--radius-lg`), and shadow (`--shadow-lg`)

#### Scenario: Styled calendar header
- **WHEN** the calendar is open
- **THEN** the header MUST have a `--color-linen` background, bottom border `--color-border`, and navigation buttons MUST have hover with `--color-sage-pale` and color `--color-sage-dark`
- **THEN** the month/year title MUST use display typography and color `--color-text-primary`

#### Scenario: Styled calendar days
- **WHEN** the calendar displays the days of the month
- **THEN** the days MUST have color `--color-text-primary`
- **THEN** days from other months MUST have color `--color-text-muted`
- **THEN** hover over a day MUST show background `--color-sage-pale`

#### Scenario: Selected day with brand color
- **WHEN** the user selects a day in the calendar
- **THEN** the selected day MUST have background `--color-sage` and white text
- **THEN** today MUST have a distinctive visual indicator with color `--color-sage-dark`

#### Scenario: Styled datepicker input
- **WHEN** the `p-datepicker` input is rendered
- **THEN** the input MUST have the same styles as the other PrimeNG inputs in the application (borders, focus, placeholder)

#### Scenario: Styled button bar
- **WHEN** the calendar has `[showButtonBar]="true"`
- **THEN** the "Today" and "Clear" buttons MUST have styles consistent with the application buttons

#### Scenario: Styled weekday headers
- **WHEN** the calendar displays weekday headers
- **THEN** the headers MUST have color `--color-text-secondary`, uppercase font, and weight 600
