# appointment-management Delta Specification

## Purpose

Add the capability to query appointments grouped by employee within a date range, with computed totals for amounts and commissions.

## ADDED Requirements

### Requirement: Aggregate appointment queries by employee

The appointment service SHALL support querying appointments grouped by employee for a given date range and company.

#### Scenario: Fetch employee summary for date range
- **GIVEN** a company has appointments within a date range
- **WHEN** the system calls `getWeeklySummary(companyId, startDate, endDate)`
- **THEN** each row contains: employee_id, employee_name, total_appointments (completed only), total_amount, total_commission

#### Scenario: Fetch employee appointment detail
- **GIVEN** an employee has appointments within a date range
- **WHEN** the system calls `getEmployeeDetail(companyId, employeeId, startDate, endDate)`
- **THEN** all appointments for that employee in the range are returned (all statuses)
- **AND** each appointment includes its services with commission_percentage

#### Scenario: Commission calculation per appointment
- **GIVEN** an appointment with multiple services and an `amount_collected`
- **WHEN** calculating the commission
- **THEN** for each service, multiply the proportional amount by the service's commission_percentage
- **AND** sum all service commissions for the total appointment commission