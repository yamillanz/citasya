# Spec: Services CRUD

## Overview

Allow managers to create, read, update, and delete services offered by their company.

## Requirements

### R1: Services List View
- Display all services for the company
- Show service name, duration, and price
- Provide edit and delete actions for each service
- Show empty state when no services exist
- Button to create new service

### R2: Create Service
- Form with fields:
  - Name (required, min 2 characters)
  - Duration in minutes (required, min 5)
  - Price (optional)
- Save to ServiceService
- Redirect to list on success
- Show error on failure

### R3: Edit Service
- Pre-populate form with existing data
- Same validation as create
- Update via ServiceService
- Redirect to list on success

### R4: Delete Service
- Confirm before deletion
- Remove from ServiceService
- Update list after deletion

## Scenarios

### S1: View Services List
**Given** a manager has services configured
**When** they navigate to /bo/services
**Then** they see a list of all services

### S2: Create New Service
**Given** the manager is on the services list
**When** they click "Nuevo Servicio"
**And** fill in the form with valid data
**And** click "Guardar"
**Then** the service is created
**And** they are redirected to the list

### S3: Edit Service
**Given** a service exists
**When** the manager clicks "Editar"
**And** modifies the service data
**And** saves
**Then** the service is updated

### S4: Delete Service with Confirmation
**Given** a service exists
**When** the manager clicks "Eliminar"
**And** confirms the deletion
**Then** the service is removed from the list

## API Requirements

- `GET /services?company_id={id}` - List services
- `POST /services` - Create service
- `PATCH /services/{id}` - Update service
- `DELETE /services/{id}` - Delete service

## UI Components Needed

- p-card for service items
- p-button for actions
- p-inputText for form fields
- p-inputNumber for duration and price
- p-confirmDialog for deletion
