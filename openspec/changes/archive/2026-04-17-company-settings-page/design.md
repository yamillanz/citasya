## Context

The manager backoffice already has separate routes for dashboard, employees, services, appointments, daily close, and reports. Company operational data is split across `companies`, `services`, and `schedules`, but there is no single place where a manager can review and update the company configuration.

This change adds a dedicated settings page at `/bo/settings` to centralize company information, daily business hours, and a read-only view of services.

## Goals / Non-Goals

**Goals:**
- Add a new manager settings view at `/bo/settings`
- Allow editing company name, address, and phone
- Allow editing schedules per day of week using existing `ScheduleService`
- Show services and their commissions in a read-only table
- Add navigation entry in the backoffice sidebar

**Non-Goals:**
- Editing services from the new settings page
- Changing how commissions are stored or calculated
- Adding new database tables or new configuration models
- Reworking the existing services management screen

## Decisions

### D1: Reuse existing domain models

**Decision:** Use `Company`, `Schedule`, and `Service` as-is.

**Rationale:** The required data already exists in the current domain model. Creating a new settings model would duplicate state and add unnecessary synchronization work.

### D2: Persist company info and schedules separately

**Decision:** Save company fields through `CompanyService.update()` and schedules through `ScheduleService.create()` / `update()`.

**Rationale:** These pieces of data belong to different tables. Keeping the persistence split preserves the current data model and avoids a larger refactor.

### D3: Build the UI as a standalone Angular page

**Decision:** Implement the page as a standalone component under `features/backoffice/manager/settings/`.

**Rationale:** This matches the current Angular architecture in the project and keeps the feature isolated and lazy-loadable.

### D4: Keep services read-only here

**Decision:** Display services in a `p-table` without inline editing.

**Rationale:** The service form already exists in `/bo/services`. Duplicating edit controls here would create two competing entry points for the same operation.

### D5: Use a single save action

**Decision:** Provide one `Guardar` button for all editable sections.

**Rationale:** This simplifies the UX and reduces partial-save confusion when managers update company data and schedules together.

### D6: Default missing schedules to inactive

**Decision:** If a day has no schedule row in the database, show it with default times but inactive.

**Rationale:** This makes missing configuration explicit and avoids accidentally enabling hours that the manager never set.

## Risks / Trade-offs

- Saving company info and schedules together is not truly atomic unless the backend supports a transaction. The current app uses direct client-side calls, so partial failure is possible.
- The settings page introduces a second place where the company name and phone are visible, which increases the surface area for stale data if other screens cache company info.
- Working with time inputs requires careful formatting because the database stores `TIME` values and the UI may need `HH:mm` strings.

## Open Questions

- None. The scope is defined: edit company info, edit schedules per day, and show services read-only.
