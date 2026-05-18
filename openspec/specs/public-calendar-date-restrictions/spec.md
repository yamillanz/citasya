# public-calendar-date-restrictions Specification

## Purpose
TBD - created by archiving change block-past-dates-public-calendar. Update Purpose after archive.
## Requirements
### Requirement: Past dates shall be blocked in public booking calendar

The FullCalendar component in the public employee booking page (`/c/:company_slug/e/:employee_id`) SHALL NOT allow users to select dates prior to the current day. Past dates MUST be visually disabled and non-interactive.

#### Scenario: User views calendar with past dates visible
- **WHEN** the user opens the public booking calendar
- **THEN** dates before today's date are displayed but cannot be clicked or selected

#### Scenario: User attempts to click a past date
- **WHEN** the user clicks on a date that is before today
- **THEN** the date selection handler is not triggered and no date is selected

#### Scenario: User attempts to drag-select a range containing past dates
- **WHEN** the user drags to select a date range that includes past dates
- **THEN** only dates from today onwards are selected, past dates are excluded

#### Scenario: User navigates to previous month
- **WHEN** the user navigates to a previous month using the calendar navigation
- **THEN** all dates in that month (if entirely in the past) remain non-selectable

### Requirement: Today and future dates remain fully selectable

Dates from today onwards SHALL remain fully selectable and interactive in the public booking calendar.

#### Scenario: User clicks on today's date
- **WHEN** the user clicks on today's date
- **THEN** the date is selected and available slots are loaded

#### Scenario: User clicks on a future date
- **WHEN** the user clicks on any date after today
- **THEN** the date is selected and available slots are loaded

