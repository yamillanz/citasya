# employee-percentage-field Specification

## Purpose
TBD - created by archiving change add-employee-percentage-to-services. Update Purpose after archive.
## Requirements
### Requirement: Employee percentage field in service form
The system SHALL allow managers to specify what percentage of the service price goes to the employee.

#### Scenario: Default percentage on new service
- **WHEN** manager opens the new service form
- **THEN** commission_percentage field shows 50% as default value

#### Scenario: Valid percentage range
- **WHEN** manager enters a value outside 0-100 range
- **THEN** field shows validation error

#### Scenario: Service saves with percentage
- **WHEN** manager saves a service with commission_percentage set to 70
- **THEN** the service is saved with commission_percentage: 70

#### Scenario: Edit service loads existing percentage
- **WHEN** manager edits an existing service with commission_percentage: 60
- **THEN** the form displays 60 in the commission_percentage field

#### Scenario: Preview shows percentage
- **WHEN** service form has commission_percentage filled
- **THEN** the preview card displays the percentage value

