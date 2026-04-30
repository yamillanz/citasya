# data-refresh-control Specification

## Purpose
Provides a manual data refresh control for views that display dynamic data, allowing users to trigger a reload of the current view's data without navigating away.

## Requirements

### Requirement: Refresh button displays in component header area
The system SHALL display a small icon-only refresh button in the header/navigation area of supported views.

#### Scenario: Refresh button visible in backoffice employee calendar
- **WHEN** the backoffice employee calendar view is displayed
- **THEN** a refresh icon button appears in the calendar header, before the "Tu link" button

#### Scenario: Refresh button visible in public employee calendar
- **WHEN** the public employee calendar view is displayed with a selected date and available slots
- **THEN** a refresh icon button appears next to the selected date display in the slots section header

#### Scenario: Refresh button visible in daily close workbench
- **WHEN** the daily close view is displayed
- **THEN** a refresh icon button appears in the date navigation bar, between the "Fecha seleccionada" label and the date picker

### Requirement: Refresh button triggers data reload
The system SHALL reload the view's data when the user clicks the refresh button.

#### Scenario: Clicking refresh reloads backoffice employee calendar data
- **WHEN** user clicks the refresh button on the backoffice employee calendar
- **THEN** the component calls `loadAppointments()` to fetch fresh appointment data
- **AND** the calendar view updates with the latest data

#### Scenario: Clicking refresh reloads public employee calendar data
- **WHEN** user clicks the refresh button on the public employee calendar
- **THEN** the component calls `loadAvailableSlots()` to fetch fresh slot data for the currently selected date and services
- **AND** the time slots display updates with the latest availability

#### Scenario: Clicking refresh reloads daily close data
- **WHEN** user clicks the refresh button on the daily close view
- **THEN** the facade calls `loadAppointments()` to fetch fresh appointment data for the selected date
- **AND** the stats, employee list, and appointment details update with the latest data

### Requirement: Visual feedback during refresh
The system SHALL provide visual feedback while data is being refreshed.

#### Scenario: Spinning animation during refresh
- **WHEN** the refresh button is clicked and data loading begins
- **THEN** the refresh icon displays a spinning animation (pi-spin pi-spinner)
- **AND** the button is visually indicated as active/loading

#### Scenario: Animation stops when loading completes
- **WHEN** data loading completes (success or error)
- **THEN** the spinning animation stops
- **AND** the refresh icon returns to its static state (pi-refresh)

### Requirement: Prevent duplicate refresh requests
The system SHALL prevent the user from triggering multiple simultaneous refresh operations.

#### Scenario: Button disabled during loading
- **WHEN** data is currently being loaded (loading signal is true)
- **THEN** the refresh button is disabled
- **AND** clicking the button has no effect

#### Scenario: Button re-enabled after loading
- **WHEN** data loading completes (loading signal becomes false)
- **THEN** the refresh button is re-enabled for interaction