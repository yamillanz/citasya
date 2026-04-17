# company-settings Specification

## Purpose

Provide managers with a unified settings page to view and edit their company's operational configuration: general information, business hours per day, and a read-only view of services with rates and commissions.

## ADDED Requirements

### Requirement: Settings page navigation

The system SHALL provide a settings page accessible from the backoffice sidebar.

#### Scenario: Navigate to settings
- **GIVEN** a manager is logged in
- **WHEN** they click "Configuración" in the sidebar
- **THEN** they are navigated to `/bo/settings`

#### Scenario: Sidebar highlight
- **GIVEN** the manager is on the settings page
- **THEN** the "Configuración" menu item is highlighted in the sidebar

### Requirement: General information section

The system SHALL display and allow editing of basic company information.

#### Scenario: Load company info
- **GIVEN** a manager navigates to `/bo/settings`
- **THEN** the system displays the company name, address, and phone in editable fields
- **AND** the fields are pre-filled with current company data

#### Scenario: Edit company name
- **GIVEN** the manager modifies the company name
- **AND** the name is not empty
- **WHEN** they save the settings
- **THEN** the company name is updated in the database

#### Scenario: Edit company address
- **GIVEN** the manager modifies the company address
- **WHEN** they save the settings
- **THEN** the company address is updated in the database

#### Scenario: Edit company phone
- **GIVEN** the manager modifies the company phone
- **WHEN** they save the settings
- **THEN** the company phone is updated in the database

#### Scenario: Empty required field validation
- **GIVEN** the manager clears the company name field
- **WHEN** they attempt to save
- **THEN** the system shows a validation error: "El nombre de la empresa es obligatorio"

### Requirement: Business hours configuration

The system SHALL allow the manager to configure the business hours for each day of the week individually.

#### Scenario: Load existing schedule
- **GIVEN** a manager navigates to `/bo/settings`
- **THEN** the system displays 7 rows (Lunes through Domingo)
- **AND** each row shows the day name, start time, end time, and an active/inactive toggle
- **AND** existing schedule data is pre-filled in the form

#### Scenario: Day structure
- **GIVEN** the schedule section is displayed
- **THEN** each day row contains: day name label, start time input, end time input, and active toggle
- **AND** days are shown in order: Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo

#### Scenario: Toggle day active/inactive
- **GIVEN** a day row is active (toggle ON)
- **WHEN** the manager toggles it OFF
- **THEN** the start time and end time inputs are disabled or dimmed
- **AND** the day is marked as inactive in the saved data

#### Scenario: Toggle day inactive to active
- **GIVEN** a day row is inactive (toggle OFF)
- **WHEN** the manager toggles it ON
- **THEN** the start time and end time inputs become enabled
- **AND** default times are set (09:00 - 18:00) if no times were previously set

#### Scenario: Validate time range
- **GIVEN** a day is active
- **WHEN** the manager sets start time equal to or after end time
- **THEN** the system shows a validation error: "La hora de inicio debe ser anterior a la hora de fin"

#### Scenario: Save schedule changes
- **GIVEN** the manager has modified one or more day schedules
- **WHEN** they save the settings
- **THEN** each day's schedule is updated via ScheduleService (update existing or create new)
- **AND** inactive days are saved with `is_active: false`

#### Scenario: Missing days in database
- **GIVEN** some days have no schedule record in the database
- **WHEN** the settings page loads
- **THEN** missing days are shown with default times (09:00 - 18:00) and toggled OFF

### Requirement: Services read-only view

The system SHALL display existing company services in a read-only table with a link to edit them.

#### Scenario: Load services list
- **GIVEN** a manager navigates to `/bo/settings`
- **THEN** the system displays a table listing all services of the company
- **AND** each row shows: Nombre, Duración (min), Precio, Comisión (%)

#### Scenario: Service table is read-only
- **GIVEN** the services table is displayed
- **THEN** no inline editing controls are shown
- **AND** each row has no action buttons for editing or deleting

#### Scenario: Link to service management
- **GIVEN** the services section is displayed
- **THEN** a link or button "Gestionar servicios" is shown
- **WHEN** clicked
- **THEN** the manager is navigated to `/bo/services`

#### Scenario: No services
- **GIVEN** the company has no services
- **WHEN** the settings page loads
- **THEN** an empty state message is displayed: "No hay servicios registrados"
- **AND** a link to create services at `/bo/services` is offered

### Requirement: Save all settings

The system SHALL provide a single save action for all settings sections.

#### Scenario: Successful save
- **GIVEN** the manager has modified settings in any section
- **WHEN** they click "Guardar"
- **THEN** all changes (company info + schedule) are persisted atomically
- **AND** a success toast message is shown: "Configuración guardada correctamente"

#### Scenario: Save while loading
- **GIVEN** the save action is in progress
- **THEN** the "Guardar" button shows a loading spinner
- **AND** the button is disabled to prevent double submission

#### Scenario: Save failure
- **GIVEN** the save action fails due to a network or server error
- **THEN** an error toast message is shown: "Error al guardar la configuración"
- **AND** the form retains the unsaved changes

#### Scenario: Unsaved changes warning
- **GIVEN** the manager has unsaved changes
- **AND** they attempt to navigate away from the settings page
- **THEN** a confirmation dialog asks: "Hay cambios sin guardar. ¿Deseas salir?"

### Requirement: Loading states

The system SHALL display loading indicators during data fetching.

#### Scenario: Initial page load
- **GIVEN** the manager navigates to `/bo/settings`
- **WHEN** data is being fetched
- **THEN** a loading skeleton is displayed for each section

### Requirement: Responsive layout

The settings page SHALL be usable on mobile devices.

#### Scenario: Mobile view
- **GIVEN** the manager views the settings page on a mobile device
- **THEN** sections are stacked vertically
- **AND** the schedule rows display time inputs stacked (not inline)
- **AND** the services table scrolls horizontally if needed