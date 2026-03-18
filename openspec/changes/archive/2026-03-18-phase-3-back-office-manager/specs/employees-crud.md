# Spec: Employees CRUD

## Overview

Allow managers to manage their employee roster, including profile information and service assignments.

## Requirements

### R1: Employees List View
- Display all employees with:
  - Profile photo (or default avatar)
  - Full name
  - Email
  - Phone number
  - Active/inactive status
- Toggle active status per employee
- Edit and deactivate actions
- Empty state when no employees

### R2: Create Employee
- Form fields:
  - Email (required, valid email)
  - Full name (required, min 2 chars)
  - Phone (optional)
  - Photo URL (optional)
- Checkboxes to assign services
- Save to UserService with role='employee'

### R3: Edit Employee
- Pre-populate with existing data
- Update profile information
- Modify service assignments
- Save changes

### R4: Toggle Active Status
- Button to activate/deactivate employee
- Update is_active flag via UserService
- Reflect change immediately in UI

## Scenarios

### S1: View Employees
**Given** employees exist in the company
**When** the manager navigates to /bo/employees
**Then** they see all employees with their details

### S2: Add New Employee
**Given** the manager is on employees list
**When** they click "Nuevo Empleado"
**And** fill in required fields
**And** assign services
**And** save
**Then** the employee is created with role='employee'

### S3: Deactivate Employee
**Given** an employee is active
**When** the manager clicks "Desactivar"
**Then** the employee status changes to inactive
**And** the button changes to "Activar"

### S4: Edit Employee Profile
**Given** an employee profile exists
**When** the manager edits the profile
**And** saves changes
**Then** the profile is updated

## API Requirements

- `GET /users?company_id={id}&role=employee` - List employees
- `POST /users` - Create employee
- `PATCH /users/{id}` - Update employee
- Employee-service assignments (future table)

## UI Components Needed

- p-card for employee items
- p-avatar for photos
- p-button for actions
- p-inputText for form fields
- p-checkbox for service selection
- p-tag for status indicators
