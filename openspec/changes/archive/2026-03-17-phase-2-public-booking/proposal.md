## Why

Enable public access to company and employee calendars for appointment booking without requiring client registration. This eliminates friction in the booking process, allowing potential clients to quickly schedule appointments via shareable links. This is a core differentiator for CitasYa and essential for Phase 2 of the SaaS platform.

## What Changes

- Create public-facing pages for company profiles, employee selection, and appointment booking
- Implement 5 new core services: CompanyService, UserService, ServiceService, ScheduleService, AppointmentService
- Integrate FullCalendar for date/time selection with slot availability calculation
- Add public routes: `/c/:slug`, `/c/:slug/e/:id`, `/c/:slug/e/:id/book`
- Enable appointment creation without client authentication

## Capabilities

### New Capabilities

- **company-directory**: Public company listing page showing available employees and their services
- **employee-calendar**: Public employee calendar with FullCalendar integration for date selection
- **appointment-booking**: Public booking form for creating appointments without client registration
- **slot-availability**: Calculation of available time slots based on employee schedules and existing appointments

### Modified Capabilities

- None (Phase 1 is complete; this is a new capability set)

## Impact

- **New Services**: `CompanyService`, `UserService`, `ServiceService`, `ScheduleService`, `AppointmentService` in `src/app/core/services/`
- **New Components**: `CompanyListComponent`, `EmployeeCalendarComponent`, `BookingFormComponent` in `src/app/features/public/`
- **New Routes**: Public routes added to `app.routes.ts`
- **Dependencies**: FullCalendar integration (`@fullcalendar/angular`)
- **Database**: Uses existing tables (companies, users, services, schedules, appointments)
