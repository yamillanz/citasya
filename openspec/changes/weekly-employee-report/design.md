## Context

CitasYa is an appointment management system built with Angular 20, PrimeNG, and Supabase. Managers currently have a dashboard with daily stats and a "Cierre Diario" (daily close) feature that generates PDFs, but there is no weekly reporting capability to see employee performance over time. The app uses signals, standalone components, Facade pattern (seen in daily-close), and Supabase direct queries.

The database has `services` without a `commission_percentage` field. Commission calculation is a new concept that needs to be added at the service level. The appointment model already supports multiple services via `appointment_services` join table.

## Goals / Non-Goals

**Goals:**
- Add `commission_percentage` field to `services` table and TypeScript model
- Create a weekly report view at `/bo/reports/weekly` showing employee summary
- Create an employee detail modal showing all appointments (all statuses)
- CSV export for both summary and detail views
- Add "Reportes" to the backoffice sidebar navigation

**Non-Goals:**
- Commission configuration UI (editing commission percentages on services) — will be added separately
- PDF export for the weekly report (CSV only for now)
- Employee-facing report (this is manager-only)
- Monthly or custom-period reports (future consideration)
- Real-time updates (data fetched on page load and filter changes)

## Decisions

### D1: commission_percentage on services table (NOT employee_services)

**Decision**: Add `commission_percentage numeric(5,2) NOT NULL DEFAULT 0` to the `services` table.

**Rationale**: As discussed, all employees earn the same commission for a given service. This keeps the model simple and avoids the complexity of per-employee overrides. The field is on `services` because the commission is a property of the service, not the employee-service relationship.

**Future consideration**: If per-employee commissions are needed later, we can add an optional `commission_percentage` override on `employee_services` that falls back to the service-level default.

### D2: Commission calculation — proportional method

**Decision**: When an appointment has multiple services, calculate commission proportionally:
- For each service: `(service.price / total_price) * amount_collected * (commission_percentage / 100)`
- Sum all service commissions for the appointment total

**Rationale**: An appointment's `amount_collected` may differ from the sum of service prices (discounts, tips, etc.). The proportional method fairly distributes the collected amount across services and applies each service's commission rate to its share.

**Alternative considered**: Flat split (equal division by number of services). Rejected because services have different prices and commission rates — a $100 service with 50% commission shouldn't earn the same as a $20 service.

### D3: Modal (p-dialog) for employee detail instead of separate page

**Decision**: Use `p-dialog` for the employee detail view.

**Rationale**: 
- Matches existing pattern used in employee-history (click row → open dialog)
- Maintains context (user doesn't lose their filter state and position in the summary)
- Faster to implement (no new route, no navigation)
- Detail data is simple enough for a modal

### D4: Standalone WeeklyReportService vs extending AppointmentService

**Decision**: Create a new `WeeklyReportService` in `core/services/`.

**Rationale**: The weekly report queries are fundamentally different from existing appointment queries — they aggregate data by employee with commission calculations. Keeping this separate follows single responsibility principle and avoids bloating the existing `AppointmentService`. The service can reuse `AppointmentService` for raw data fetching if beneficial, but aggregation logic belongs in its own service.

### D5: Use signals + computed pattern (no Facade for this)

**Decision**: Use signals directly in the component with computed signals for derived data, similar to the dashboard component pattern (not the Facade pattern from daily-close).

**Rationale**: The weekly report has simpler state management than daily-close (no multi-step workflow, no draft state). A service + signals in the component is cleaner and more maintainable. If complexity grows, we can refactor to a Facade later.

### D6: CSV export utility extraction

**Decision**: Create a shared `CsvExportService` in `shared/services/` to avoid duplicating CSV logic between the summary, detail, and existing employee-history export.

**Rationale**: The employee-history component already has CSV export logic inline. The new report needs CSV export in two places. Extracting to a shared service follows DRY and creates a reusable utility. The existing employee-history can be refactored to use it later.

### D7: Route structure — `/bo/reports/weekly`

**Decision**: Add a `reports` child route to manager routes with `weekly` as the first sub-route.

**Rationale**: Follows existing pattern (`/bo/close`, `/bo/dashboard`, etc.). The `reports` path allows future report types (monthly, by-service) without restructuring.

## Risks / Trade-offs

### Commission calculation accuracy
**Risk**: Proportional calculation could produce rounding discrepancies (fractions of cents)  
**Mitigation**: Round commission to 2 decimal places at the appointment level. Display totals with 2 decimal places consistently.

### Default commission_percentage = 0
**Risk**: Existing services will have 0% commission, meaning reports will show $0 commission for all appointments until managers update the values  
**Mitigation**: This is acceptable for initial release. The report will still show total_appointments and total_amount correctly. Commission column shows $0 until configured. A future change will add commission editing to the service form.

### Large data sets
**Risk**: Companies with many employees or thousands of appointments per week could experience slow queries  
**Mitigation**: Supabase queries use indexed columns (company_id, employee_id, appointment_date). Pagination in the detail table. No pagination in summary (typically few employees).可以考虑 future server-side aggregation if needed.

### CSV encoding
**Risk**: CSV exports with special characters (accents, ñ) may not render correctly in Excel  
**Mitigation**: Use BOM character (`\ufeff`) prefix for UTF-8, matching existing pattern in employee-history.

## Open Questions

- None remaining. All decisions have been made through the brainstorming process.