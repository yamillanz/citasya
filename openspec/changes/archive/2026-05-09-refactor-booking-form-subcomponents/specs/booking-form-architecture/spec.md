# booking-form-architecture Specification

## Purpose

Define the component architecture for the booking form as a step-based wizard with extracted sub-components, parent orchestration, and signal-based state management.

## Requirements

### Requirement: Step-based wizard architecture

The booking form SHALL be structured as a wizard with four distinct step components managed by a parent orchestrator.

#### Scenario: Parent orchestrates step navigation
- **WHEN** the booking form loads
- **THEN** the parent component manages the current step index as a signal
- **AND** renders the appropriate sub-component based on the active step

#### Scenario: Step components are independent
- **WHEN** a step component is rendered
- **THEN** it receives only the data it needs via signal inputs
- **AND** emits events to the parent for navigation or submission

### Requirement: Selection step component

The selection step SHALL handle service selection, employee selection, and date/time picking.

#### Scenario: Receive and display services
- **WHEN** the selection step receives a list of services
- **THEN** it displays them as selectable options
- **AND** emits the selected service IDs to the parent

#### Scenario: Employee and date selection
- **WHEN** the user selects an employee and date
- **THEN** the step validates availability
- **AND** enables the proceed action when valid

### Requirement: Summary step component

The summary step SHALL display a read-only review of the booking before confirmation.

#### Scenario: Display booking summary
- **WHEN** the summary step receives booking data
- **THEN** it displays selected services, employee, date, time, duration, and total price
- **AND** provides no interactive controls for modification

### Requirement: Contact form step component

The contact form step SHALL collect client contact information and emit submission events.

#### Scenario: Collect contact information
- **WHEN** the user fills the contact form
- **THEN** the step validates required fields (name, phone, email)
- **AND** emits the form data to the parent on submit

#### Scenario: Prevent double submission
- **WHEN** the user clicks submit
- **THEN** the step sets an internal `isSubmitting` flag
- **AND** ignores subsequent submit attempts until the flag is reset

### Requirement: Success step component

The success step SHALL display booking confirmation and next steps.

#### Scenario: Display confirmation
- **WHEN** the success step receives booking confirmation data
- **THEN** it displays a success message with booking details
- **AND** shows next steps (calendar link, contact info)

### Requirement: Parent-child communication

The parent component SHALL communicate with sub-components using Angular signals and outputs.

#### Scenario: Pass data to children
- **WHEN** the parent renders a step
- **THEN** it passes data via `input()` signals
- **AND** the child reads values reactively

#### Scenario: Receive events from children
- **WHEN** a child emits an event (next, submit, etc.)
- **THEN** the parent handles it via `output()` emitters
- **AND** updates step navigation or triggers API calls

### Requirement: Initial loading state

The booking form SHALL display a loading spinner while fetching initial data.

#### Scenario: Show spinner during data fetch
- **WHEN** the booking form loads and data is being fetched
- **THEN** it displays a progress spinner
- **AND** hides step content until data is ready

#### Scenario: Hide spinner after data loads
- **WHEN** initial data fetch completes
- **THEN** the spinner is removed
- **AND** the first step is rendered
