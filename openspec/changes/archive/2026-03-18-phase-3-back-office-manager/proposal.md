# Phase 3: Back Office Manager - Proposal

## Overview

Create a comprehensive back office management interface for business owners to manage their appointments, employees, services, and daily operations.

## Why

After completing Phase 2 (Public Booking Portal), businesses now need a complete back office system to:
- Monitor daily appointments and business metrics
- Manage their employee roster and service offerings
- Track appointment statuses and handle cancellations
- Generate daily close reports for accounting purposes

This phase will provide managers with full control over their business operations through an intuitive dashboard interface.

## What

### Core Features

1. **Manager Dashboard**
   - Welcome header with user information
   - Statistics cards (today's appointments, completed, pending)
   - Quick actions navigation
   - List of today's appointments with status indicators

2. **Services CRUD**
   - List all company services
   - Create new services with name, duration, and price
   - Edit existing services
   - Delete services with confirmation

3. **Employee Management**
   - List all employees with photos and contact info
   - Create/edit employees with profile data
   - Toggle employee active/inactive status
   - Assign services to employees

4. **Appointments Management**
   - View all company appointments
   - Filter by employee, date, and status
   - Update appointment status (pending, completed, cancelled, no_show)
   - Track amount collected for completed appointments

5. **Daily Close with PDF Generation**
   - View appointments for a selected date
   - Calculate totals and employee breakdowns
   - Generate PDF report using jsPDF
   - Save close records to database

### Routes

- `/bo/dashboard` - Manager dashboard
- `/bo/services` - Services list
- `/bo/services/:id` - Service form (create/edit)
- `/bo/employees` - Employees list
- `/bo/employees/:id` - Employee form (create/edit)
- `/bo/appointments` - Appointments list with filters
- `/bo/close` - Daily close interface

### Technical Stack

- Angular 20+ standalone components
- PrimeNG UI components
- Signals for state management
- Supabase for backend
- jsPDF for PDF generation
- FullCalendar for calendar views (future enhancement)

## Success Criteria

- [ ] Manager can view dashboard with real-time statistics
- [ ] CRUD operations work for services and employees
- [ ] Appointments can be filtered and status-updated
- [ ] Daily close generates valid PDF reports
- [ ] All routes are protected and accessible only to authenticated managers

## Estimated Effort

~5.5 hours

## Dependencies

- Phase 1 (Foundation) - Authentication, database, core services
- Phase 2 (Public Booking) - Appointment service, company context
