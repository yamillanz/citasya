# superadmin-assignments Specification

## ADDED Requirements

### Requirement: Superadmin can assign a plan to a company
The system SHALL allow superadmin to assign or change the subscription plan for a company.

#### Scenario: Assign plan to company
- **WHEN** superadmin edits a company and selects a plan from dropdown
- **AND** clicks "Guardar"
- **THEN** system updates company's plan_id
- **AND** system shows success toast message

#### Scenario: Change company plan
- **WHEN** superadmin edits a company with an existing plan
- **AND** selects a different plan
- **AND** clicks "Guardar"
- **THEN** system updates company's plan_id to the new plan
- **AND** system shows success toast message

### Requirement: Superadmin can view current plan per company
The system SHALL display the currently assigned plan name in the company list and detail view.

#### Scenario: Company list shows plan name
- **WHEN** superadmin views `/sa/companies`
- **THEN** each company row shows the name of the assigned plan (or "Sin plan" if none)

#### Scenario: Company detail shows plan
- **WHEN** superadmin clicks to edit a company
- **THEN** the plan dropdown shows the currently selected plan

### Requirement: Superadmin can create users for a company
The system SHALL allow superadmin to create manager or employee users that belong to a specific company.

#### Scenario: Create user with company assignment
- **WHEN** superadmin creates a user at `/sa/users/new`
- **AND** selects a company from the dropdown
- **AND** sets role as manager or employee
- **THEN** system creates user with company_id set to selected company

#### Scenario: User appears in company's user list
- **WHEN** superadmin creates a user for company "X"
- **THEN** the user is visible when filtering `/sa/users` by company "X"

### Requirement: Superadmin can view users per company
The system SHALL allow superadmin to filter the user list by company to see all users belonging to that company.

#### Scenario: Filter users by company
- **WHEN** superadmin selects "Company A" from the company filter dropdown
- **THEN** system shows only users where company_id = Company A's id

#### Scenario: Clear company filter
- **WHEN** superadmin clears the company filter
- **THEN** system shows all users across all companies
