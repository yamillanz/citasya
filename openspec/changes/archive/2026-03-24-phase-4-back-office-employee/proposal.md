# Phase 4: Back Office Employee - Proposal

## Overview

Create a restricted back office interface for employees to view their personal calendar and appointment history.

## Why

After completing Phase 3 (Manager Back Office), employees need their own dedicated space to:
- View their assigned appointments on a calendar
- See their personal appointment history
- Track their performance through completed appointments

This phase provides employees with a focused view of their work, while maintaining strict data isolation (employees only see their own data).

## What

### Core Features

1. **Employee Calendar View**
   - FullCalendar integration showing personal appointments
   - Display appointment time, client name, and service
   - Click on appointment to see details
   - Filter by date range

2. **Employee History**
   - List of all completed appointments
   - Show date, time, client, service, and amount
   - Pagination for large history lists
   - Filter by date range

### Routes

- `/emp/calendar` - Personal calendar view
- `/emp/history` - Appointment history

### Constraints

- Employees can ONLY see their own appointments
- No CRUD operations for employees (managed by Manager)
- No access to other employees' data
- No daily close functionality (Manager only)
- No service/employee management

### Technical Stack

- Angular 20+ standalone components
- PrimeNG UI components
- Signals for state management
- Supabase for backend
- FullCalendar for calendar views

## Success Criteria

- [ ] Employee can view their calendar with appointments
- [ ] Employee can filter calendar by date
- [ ] Employee can view their appointment history
- [ ] Employee cannot access other employees' data
- [ ] All routes are protected and accessible only to authenticated employees

## Estimated Effort

~2 hours

## Dependencies

- Phase 1 (Foundation) - Authentication, database, core services
- Phase 2 (Public Booking) - Appointment service, FullCalendar integration
- Phase 3 (Manager Back Office) - UserService, AppointmentService
