# service-commission Specification

## Purpose
TBD - created by archiving change weekly-employee-report. Update Purpose after archive.
## Requirements
### Requirement: Commission percentage on services

Each service SHALL have a commission percentage that determines the employee's share of the amount collected.

#### Scenario: Service with commission
- **GIVEN** a service has `commission_percentage` set to 50
- **AND** an appointment with that service has `amount_collected` of $100
- **WHEN** calculating the employee's commission
- **THEN** the commission equals $50 (50% of $100)

#### Scenario: Service with zero commission
- **GIVEN** a service has `commission_percentage` set to 0
- **WHEN** calculating the employee's commission
- **THEN** the commission equals $0

#### Scenario: Service with default commission
- **GIVEN** a new service is created without specifying commission
- **THEN** the `commission_percentage` defaults to 0

#### Scenario: Multiple services on one appointment
- **GIVEN** an appointment has two services: Service A (commission 40%, price $30) and Service B (commission 50%, price $70)
- **AND** the appointment `amount_collected` is $100
- **WHEN** calculating the employee's total commission
- **THEN** the commission is calculated per service based on the proportion of each service's price relative to the total
- **AND** Service A proportion: $30/$100 = 30%, commission = 30% * $100 * 40% = $12
- **AND** Service B proportion: $70/$100 = 70%, commission = 70% * $100 * 50% = $35
- **AND** total commission = $12 + $35 = $47

### Requirement: Commission in service management

The service management interface SHALL allow setting and editing the commission percentage.

#### Scenario: Create service with commission
- **GIVEN** a manager is creating a new service
- **THEN** the form includes a "Comisión (%)" field
- **AND** the field defaults to 0

#### Scenario: Edit service commission
- **GIVEN** a manager is editing an existing service
- **THEN** the form shows the current commission percentage
- **AND** the manager can modify it

#### Scenario: Validation of commission percentage
- **GIVEN** a manager enters a commission percentage
- **WHEN** the value is outside 0-100 range
- **THEN** the system shows a validation error

