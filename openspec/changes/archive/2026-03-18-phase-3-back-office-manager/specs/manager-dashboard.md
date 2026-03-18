# Spec: Manager Dashboard

## Overview

Provide business owners with a centralized dashboard to monitor their daily operations at a glance.

## Requirements

### R1: Welcome Header
- Display authenticated user's full name
- Show user email
- Load user data from AuthService

### R2: Statistics Cards
- Show total appointments for today
- Show count of completed appointments
- Show count of pending appointments
- Calculate stats from today's appointment list

### R3: Quick Actions
- Navigation cards to key sections:
  - Employees management
  - Services management
  - Appointments list
  - Daily close
- Cards should be visually distinct and clickable

### R4: Today's Appointments List
- Display appointments scheduled for today
- Show time, client name, service name
- Display status indicator (pending, completed, cancelled)
- Handle empty state when no appointments

## Scenarios

### S1: Dashboard Loads Successfully
**Given** a manager user is authenticated
**When** they navigate to /bo/dashboard
**Then** they see:
- Welcome message with their name
- Statistics cards with current data
- Quick action navigation
- Today's appointments list

### S2: No Appointments Today
**Given** today has no scheduled appointments
**When** the manager views the dashboard
**Then** they see a "No hay citas programadas para hoy" message

### S3: Statistics Update
**Given** the manager is viewing the dashboard
**When** an appointment status changes
**And** they refresh the page
**Then** statistics reflect the updated counts

## API Requirements

- `GET /appointments?company_id={id}&date={today}` - Fetch today's appointments
- `AuthService.getCurrentUser()` - Get authenticated user data

## UI Components Needed

- p-card for statistics and quick actions
- p-avatar for user photo (future)
- p-tag for status indicators
- p-button for navigation
- p-divider for visual separation
