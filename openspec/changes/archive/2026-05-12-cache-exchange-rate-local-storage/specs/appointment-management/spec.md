## MODIFIED Requirements

### Requirement: Display multiple services in appointment history

The appointment management system SHALL display all services for each appointment in a compact format.

#### Scenario: Display services in employee history
- **WHEN** an employee views their appointment history
- **THEN** each appointment shows all services as comma-separated text
- **AND** total duration and total price are displayed

#### Scenario: Display services in manager appointment list
- **WHEN** a manager views the appointments list
- **THEN** each appointment shows all services as comma-separated text
- **AND** total duration and total price are displayed

#### Scenario: Display services in appointment detail
- **WHEN** viewing appointment details
- **THEN** all services are displayed in a list format with:
  - Service name
  - Duration
  - Price (if available)

#### Scenario: Handle multiple services in table
- **WHEN** displaying appointments in a p-table component
- **THEN** services are shown in a single column as comma-separated text
- **AND** column width adjusts to content

## ADDED Requirements

### Requirement: Preload exchange rate from cache in appointment completion
The system SHALL preload the exchange rate from `ExchangeRateStorageService` when the status change drawer opens for completing an appointment, instead of defaulting to 1.

#### Scenario: Drawer opens with cached rate
- **WHEN** the manager opens the status change drawer with action 'completed'
- **AND** localStorage contains `citasya_exchange_rate` with value 6.85
- **THEN** the exchange rate field displays 6.85

#### Scenario: Drawer opens with no cached rate
- **WHEN** the manager opens the status change drawer with action 'completed'
- **AND** localStorage does not contain `citasya_exchange_rate`
- **THEN** the exchange rate field displays 1

### Requirement: Save exchange rate to cache on successful completion
The system SHALL save the exchange rate to `ExchangeRateStorageService` when an appointment is successfully marked as completed.

#### Scenario: Rate saved after successful completion
- **WHEN** the manager confirms an appointment as completed with exchange rate 7.05
- **THEN** the system calls `exchangeRateStorage.setRate(7.05)` after the API call succeeds

#### Scenario: Rate not saved for cancelled or no-show
- **WHEN** the manager marks an appointment as cancelled or no_show
- **THEN** the system does NOT update the cached exchange rate