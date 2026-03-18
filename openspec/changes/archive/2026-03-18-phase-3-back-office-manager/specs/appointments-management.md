# Spec: Appointments Management

## Overview

Allow managers to view, filter, and manage all appointments for their company.

## Requirements

### R1: Appointments List
- Display all company appointments
- Show for each appointment:
  - Date and time
  - Client name
  - Service name
  - Employee name
  - Status
- Action buttons to update status

### R2: Filters
- Filter by employee (dropdown)
- Filter by date (date picker)
- Filter by status (dropdown: all, pending, completed, cancelled, no_show)
- Filters should work in combination

### R3: Status Updates
- Pending appointments can be marked as:
  - Completed (with amount collected)
  - Cancelled
  - No-show
- Status change should update immediately in UI

### R4: Responsive Layout
- Grid or card layout for appointments
- Clear visual hierarchy
- Mobile-friendly design

## Scenarios

### S1: View All Appointments
**Given** appointments exist
**When** the manager navigates to /bo/appointments
**Then** they see all appointments with complete details

### S2: Filter by Employee
**Given** multiple employees have appointments
**When** the manager selects an employee from the filter
**Then** only that employee's appointments are shown

### S3: Mark Appointment as Completed
**Given** an appointment is pending
**When** the manager clicks "Completar"
**And** enters the amount collected
**Then** the status changes to completed
**And** the amount is recorded

### S4: Cancel Appointment
**Given** an appointment is pending
**When** the manager clicks "Cancelar"
**And** confirms the action
**Then** the status changes to cancelled

## API Requirements

- `GET /appointments?company_id={id}` - List all appointments
- `PATCH /appointments/{id}` - Update appointment status
- `GET /users?company_id={id}&role=employee` - Get employees for filter

## UI Components Needed

- p-card for appointment items
- p-dropdown for filters
- p-calendar for date filter
- p-button for status actions
- p-tag for status display
- p-inputNumber for amount input
