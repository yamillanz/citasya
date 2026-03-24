# Spec: Employee History

## Overview

Provide employees with a history view of their completed appointments.

## Requirements

### R1: History List
- Display list/table of completed appointments
- Show: date, time, client name, service, amount collected
- Paginate results (10 per page)
- Sort by date descending (newest first)

### R2: Filters
- Date range filter (from/to date pickers)
- Apply filter button
- Clear filter option

### R3: Empty State
- Show "No has atendido ninguna cita" when empty
- Show message when no results match filter

### R4: Data Display
- Client name
- Service name
- Date and time
- Amount collected
- Status badge (completed)

## Scenarios

### S1: History Loads Successfully
**Given** an employee has completed appointments
**When** they navigate to /emp/history
**Then** they see:
- List of completed appointments
- Correct data in each column
- Pagination controls

### S2: Empty History
**Given** employee has no completed appointments
**When** they view the history
**Then** they see empty state message

### S3: Filter by Date Range
**Given** employee has appointments in different months
**When** they select a date range filter
**And** they click "Aplicar"
**Then** they see only appointments within that range

### S4: Pagination
**Given** employee has more than 10 appointments
**When** they view the history
**Then** they see pagination controls
**And** can navigate between pages

## API Requirements

- `GET /appointments?employee_id={id}&status=completed` - Fetch completed appointments
- `AuthService.getCurrentUser()` - Get authenticated user data

## UI Components Needed

- p-card for container
- p-table for data display
- p-paginator for pagination
- p-calendar for date filters
- p-tag for status badges
- p-button for actions
