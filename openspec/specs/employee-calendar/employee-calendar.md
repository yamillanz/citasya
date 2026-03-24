# Spec: Employee Calendar

## Overview

Provide employees with a calendar view to see their scheduled appointments.

## Requirements

### R1: Calendar Display
- Display FullCalendar with month/week/day views
- Show appointments as calendar events
- Event shows time and client name
- Click event to show appointment details

### R2: Appointment Data
- Fetch appointments for current employee only
- Display: time, client name, service name, status
- Filter by date range
- Show only employee's assigned appointments

### R3: Navigation
- Standard calendar navigation (prev/next/today)
- Date picker to jump to specific date
- View switcher (month/week/day)

### R4: Appointment Details
- Click on event shows details in dialog/panel
- Show: date, time, client name, phone, service, status
- No edit capability (managed by Manager)

## Scenarios

### S1: Calendar Loads Successfully
**Given** an employee user is authenticated
**When** they navigate to /emp/calendar
**Then** they see:
- Calendar with their appointments
- Correct time slots filled
- Clickable events

### S2: No Appointments This Month
**Given** the employee has no appointments in visible range
**When** they view the calendar
**Then** they see empty calendar with no events

### S3: Click Appointment
**Given** calendar has appointments
**When** employee clicks on an event
**Then** they see appointment details in a dialog

## API Requirements

- `GET /appointments?employee_id={id}` - Fetch employee's appointments
- `AuthService.getCurrentUser()` - Get authenticated user data

## UI Components Needed

- p-card for container
- FullCalendar component
- p-dialog for appointment details
- p-tag for status indicator
