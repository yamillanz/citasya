# Delta Spec: appointments

## MODIFIED Requirements

### Requirement: Lazy Loading on List View

The appointments list view SHALL load appointments incrementally in batches of 10 as the user scrolls down, triggered by an Intersection Observer on a sentinel element. Exactly one sentinel element SHALL be rendered, placed after the last appointment card (outside the per-appointment `@for` loop), and only while no initial/reload fetch is in progress.

#### Scenario: Initial load of first batch

- **GIVEN** a company has 35 appointments
- **WHEN** the appointments list page loads
- **THEN** only the first 10 appointments are rendered
- **AND** a single sentinel element is present at the bottom of the list, after the last appointment card

#### Scenario: Scroll triggers next batch

- **GIVEN** the first 10 appointments are displayed and `hasMore` is true
- **WHEN** the user scrolls down and the sentinel element becomes visible
- **THEN** the next 10 appointments are fetched and appended to the list
- **AND** `totalCount` remains 35

#### Scenario: All items loaded

- **GIVEN** all 35 appointments have been loaded (`hasMore` is false)
- **WHEN** the user scrolls to the bottom
- **THEN** the sentinel element is not rendered
- **AND** a single end-of-list message "No hay más citas" is displayed once, after the last appointment card

#### Scenario: Sentinel is unique and outside the per-appointment loop

- **GIVEN** 10 appointments are displayed in list view and `hasMore` is true
- **WHEN** the template is rendered
- **THEN** exactly one `#sentinel` element exists in the DOM
- **AND** the incremental loading indicator and the end-of-list message each appear at most once, after the last appointment card (never inside an appointment card)

#### Scenario: Sentinel hidden during resource reload

- **GIVEN** `appointmentsResource.isLoading()` is true (initial load or filter change)
- **WHEN** the list view renders
- **THEN** the sentinel element is not rendered

### Requirement: Calendar View Compatibility

The calendar view tab SHALL continue to function using the same accumulated data source, displaying whatever appointments have been loaded so far. Grouping and sorting for the calendar view SHALL NOT mutate the accumulated appointments array held by the list state.

#### Scenario: Calendar shows loaded data

- **GIVEN** 10 appointments have been loaded in list view
- **WHEN** the user switches to the calendar view tab
- **THEN** those 10 appointments are displayed grouped by date

#### Scenario: Calendar reflects new loads

- **GIVEN** the user loads 10 more appointments in list view (20 total)
- **WHEN** the user switches to calendar view
- **THEN** all 20 appointments are displayed grouped by date

#### Scenario: Grouping does not mutate list state

- **GIVEN** appointments are loaded in list view
- **WHEN** `groupedAppointments` recomputes (e.g., switching to calendar view)
- **THEN** the order and identity of the `accumulatedAppointments` array remain unchanged
