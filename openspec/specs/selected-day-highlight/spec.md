# selected-day-highlight Specification

## Purpose
TBD - created by archiving change highlight-selected-day-mobile. Update Purpose after archive.
## Requirements
### Requirement: Selected day is visually highlighted on mobile
The calendar component SHALL apply a distinct visual highlight to the day cell that matches the currently selected date when the viewport width is 768px or less.

#### Scenario: Selecting a day on mobile calendar
- **WHEN** the user taps a day in the mobile calendar view
- **THEN** the tapped day cell displays a visible highlight (e.g., inset border/shadow in the brand primary color)
- **AND** the highlight remains visible while that day is the selected date
- **AND** the highlight is removed when a different day is selected

