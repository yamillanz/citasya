## Context

This design covers Phase 2 of CitasYa: Public Booking Portal. The system currently has authentication and basic data models (Phase 1 complete). This phase adds public-facing pages for booking without client registration, enabling the core value proposition of the SaaS platform.

**Current State:**
- Supabase database with tables: companies, users, services, schedules, appointments
- Existing models: Company, User, Service, Schedule, Appointment
- Authentication system in place

**Constraints:**
- Client-side only (Angular frontend)
- No backend server - all API calls go through Supabase
- Must work on mobile (Mobile First approach)
- Public pages must be fast-loading

**Stakeholders:**
- Small business owners (Managers) who will share booking links
- End clients who will book appointments
- Employees whose calendars will be exposed

## Goals / Non-Goals

**Goals:**
- Allow public access to company/employee calendars without authentication
- Integrate FullCalendar for intuitive date selection
- Calculate available slots based on schedules and existing appointments
- Create appointments with client info (name, phone, email, notes)
- Provide confirmation feedback after booking

**Non-Goals:**
- Client authentication/registration (booking without login)
- Payment processing
- Email/SMS notifications
- Appointment cancellation flow (Phase 3)
- Multi-language support (Phase N)

## Decisions

### 1. Service Layer Architecture
**Decision:** Create separate services for each domain entity (CompanyService, UserService, etc.)

**Rationale:** Follows Angular best practices for separation of concerns. Each service handles one domain entity and is injectable throughout the app. Reuses existing Supabase client injection.

**Alternative Considered:** Single PublicBookingService - rejected because it would become too large and violate single responsibility principle.

### 2. Route Structure
**Decision:** Use route parameters `/:companySlug`, `/e/:employeeId`, `/book`

**Rationale:** Clean, RESTful URL structure that's SEO-friendly and easily shareable. Using slugs instead of IDs for companies improves UX.

**Alternative Considered:** Query params for everything - rejected because nested routes provide better navigation hierarchy.

### 3. Slot Calculation Logic
**Decision:** Calculate available slots on the client side based on schedule + existing appointments

**Rationale:** Simpler than creating a database function. Client-side calculation is fast enough for single-employee queries.

**Alternative Considered:** Database function - rejected for MVP simplicity; can be optimized later if performance becomes an issue.

### 4. FullCalendar Configuration
**Decision:** Use timeGridWeek as default view with 08:00-20:00 slot hours

**Rationale:** Week view shows more context than day view. Fixed hours simplify the UI and match typical business hours.

**Alternative Considered:** dayGridMonth - rejected because week view is more practical for appointment booking.

## Risks / Trade-offs

**[Risk] Concurrent booking conflicts** → **Mitigation:** When user submits booking, re-check slot availability before committing. If slot taken, show error and prompt to select new time.

**[Risk] FullCalendar bundle size** → **Mitigation:** Use lazy loading for the calendar component. Only load FullCalendar modules when needed.

**[Risk] Mobile experience with FullCalendar** → **Mitigation:** Test on mobile devices. FullCalendar is responsive but may need custom CSS overrides for small screens.

**[Risk] No client authentication** → **Mitigation:** This is intentional for MVP. Clients identify themselves by name/phone at booking time. Future phases can add client accounts.

## Migration Plan

1. Create new service files in `src/app/core/services/`
2. Create new component files in `src/app/features/public/`
3. Update `app.routes.ts` with new routes
4. Install FullCalendar packages if not present
5. Test public flow end-to-end

**Rollback:** Remove routes from `app.routes.ts`, delete created files. No database changes needed.
