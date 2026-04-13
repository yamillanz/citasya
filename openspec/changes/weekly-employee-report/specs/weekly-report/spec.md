# weekly-report Specification

## Purpose

Provide managers with a weekly report showing employee performance: total completed appointments, amounts collected, and commissions earned. Includes a detail modal per employee and CSV export capabilities.

## Requirements

### Requirement: Weekly summary view

The system SHALL display a summary table of employee performance for a given date range.

#### Scenario: View weekly report
- **GIVEN** a manager navigates to `/bo/reports/weekly`
- **THEN** the system displays a summary table with all employees of their company
- **AND** for each employee shows: name, total completed appointments, total amount collected, total commission
- **AND** the date range defaults to the current week (Monday to Sunday)

#### Scenario: Summary aggregation
- **GIVEN** appointments exist within the selected date range
- **WHEN** the system calculates the summary
- **THEN** total_appointments counts only appointments with status `completed`
- **AND** total_amount sums the `amount_collected` of all completed appointments for that employee
- **AND** total_commission is calculated as: sum of (amount_collected * service.commission_percentage / 100) for each appointment's services

#### Scenario: Summary totals row
- **GIVEN** the summary table has data
- **THEN** a totals row is displayed at the bottom showing the sum of all employees' columns

#### Scenario: Sortable columns
- **GIVEN** the summary table is displayed
- **WHEN** the user clicks a column header
- **THEN** the table sorts by that column (ascending/descending toggle)

### Requirement: Date range filter

The system SHALL allow filtering the report by date range.

#### Scenario: Default date range
- **GIVEN** the manager opens the weekly report
- **THEN** the date range is set to the current week (Monday to Sunday)

#### Scenario: Change date range
- **GIVEN** the manager changes the date range using the calendar picker
- **WHEN** a new range is selected
- **THEN** the report data refreshes with appointments in the new range

#### Scenario: Navigation between weeks
- **GIVEN** the manager is viewing a weekly report
- **WHEN** they click previous/next week buttons
- **THEN** the date range shifts by one week and the report refreshes

### Requirement: Employee filter

The system SHALL allow optional filtering by employee.

#### Scenario: Default employee filter
- **GIVEN** the manager opens the weekly report
- **THEN** the employee filter shows "Todos los empleados" (all employees)
- **AND** all employees are shown in the summary table

#### Scenario: Filter by specific employee
- **GIVEN** the manager selects an employee from the dropdown
- **THEN** only the selected employee is shown in the summary table

#### Scenario: Clear employee filter
- **GIVEN** an employee filter is active
- **WHEN** the manager clears the filter
- **THEN** all employees are shown again

### Requirement: Employee detail modal

The system SHALL display a detail modal when clicking on an employee row.

#### Scenario: Open employee detail
- **GIVEN** the manager clicks on an employee row in the summary table
- **THEN** a `p-dialog` opens showing the employee's appointments for the selected date range
- **AND** the dialog title shows the employee name and date range

#### Scenario: Detail summary statistics
- **GIVEN** the detail modal is open
- **THEN** the system displays quick stats: total appointments, completed, pending, cancelled, no_show
- **AND** each stat shows a count with appropriate label

#### Scenario: Detail appointments table
- **GIVEN** the detail modal is open
- **THEN** all appointments for the employee in the date range are listed (all statuses)
- **AND** each row shows: date, time, client name, services, amount collected, status
- **AND** status uses `p-tag` with colors: green=completed, yellow=pending, red=cancelled, gray=no_show

#### Scenario: Detail table sorting
- **GIVEN** the detail appointments table is displayed
- **WHEN** the user clicks a column header
- **THEN** the table sorts by that column

#### Scenario: Close detail modal
- **GIVEN** the detail modal is open
- **WHEN** the user clicks "Cerrar" or the X button
- **THEN** the modal closes and the summary table is visible again

### Requirement: CSV export - Summary

The system SHALL allow exporting the summary report to CSV.

#### Scenario: Export summary CSV
- **GIVEN** the summary table has data
- **WHEN** the manager clicks "Exportar CSV"
- **THEN** a CSV file downloads with columns: Empleado, Total Citas, Total Monto, Total Comisión
- **AND** the filename format is `reporte-semanal-YYYY-MM-DD.csv`
- **AND** the CSV uses UTF-8 with BOM for Excel compatibility
- **AND** fields containing special characters are properly escaped with double quotes

#### Scenario: Export with filters applied
- **GIVEN** the manager has applied date or employee filters
- **WHEN** they click "Exportar CSV"
- **THEN** the exported CSV contains only the filtered data
- **AND** the filename includes the date range

#### Scenario: Export with no data
- **GIVEN** the summary table is empty
- **WHEN** the manager clicks "Exportar CSV"
- **THEN** the system shows a warning toast: "No hay datos para exportar"
- **AND** no CSV is generated

### Requirement: CSV export - Detail

The system SHALL allow exporting the employee detail to CSV from the modal.

#### Scenario: Export detail CSV
- **GIVEN** the detail modal is open with appointment data
- **WHEN** the manager clicks "Exportar CSV Detalle"
- **THEN** a CSV file downloads with columns: Fecha, Hora, Cliente, Servicios, Monto, Estado
- **AND** the filename format is `detalle-{empleado}-YYYY-MM-DD.csv`
- **AND** the CSV uses UTF-8 with BOM for Excel compatibility

#### Scenario: Export detail with no data
- **GIVEN** the detail modal is open but has no appointments
- **WHEN** the manager clicks "Exportar CSV Detalle"
- **THEN** the system shows a warning toast: "No hay datos para exportar"

### Requirement: Empty state

The system SHALL display appropriate empty states.

#### Scenario: No employees in company
- **GIVEN** the company has no active employees
- **WHEN** the manager views the weekly report
- **THEN** an empty state message is displayed: "No hay empleados registrados"

#### Scenario: No appointments in date range
- **GIVEN** no appointments exist in the selected date range
- **WHEN** the manager views the weekly report
- **THEN** an empty state message is displayed: "No hay citas en el período seleccionado"

### Requirement: Loading states

The system SHALL display loading indicators during data fetching.

#### Scenario: Loading summary
- **GIVEN** the report is fetching data
- **THEN** a loading skeleton or spinner is shown in the table area

#### Scenario: Loading detail
- **GIVEN** the detail modal is fetching data
- **THEN** a loading indicator is shown in the modal content area

### Requirement: Navigation access

The weekly report SHALL be accessible from the backoffice sidebar.

#### Scenario: Navigate to weekly report
- **GIVEN** a manager is logged in
- **WHEN** they click "Reportes" in the sidebar
- **THEN** they are navigated to `/bo/reports/weekly`

#### Scenario: Sidebar highlight
- **GIVEN** the manager is on the weekly report page
- **THEN** the "Reportes" menu item is highlighted in the sidebar