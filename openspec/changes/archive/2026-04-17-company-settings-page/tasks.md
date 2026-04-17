## 1. Routing and navigation

- [x] 1.1 Add `/bo/settings` route to `app-web/src/app/features/backoffice/manager/manager.routes.ts`
- [x] 1.2 Add "Configuración" item to the backoffice sidebar menu

## 2. Settings page component

- [x] 2.1 Create `settings/` feature folder under `app-web/src/app/features/backoffice/manager/`
- [x] 2.2 Create `settings.component.ts` as a standalone Angular component
- [x] 2.3 Add reactive form controls for company name, address, phone, and per-day schedules
- [x] 2.4 Load company data, schedules, and services on init
- [x] 2.5 Implement save flow using `CompanyService` and `ScheduleService`

## 3. Template and UI

- [x] 3.1 Build the general information section with PrimeNG inputs
- [x] 3.2 Build the schedule section with 7 day rows
- [x] 3.3 Build the services section as a read-only `p-table`
- [x] 3.4 Add loading states and empty states
- [x] 3.5 Add save and cancel actions

## 4. Validation and behavior

- [x] 4.1 Validate company name as required
- [x] 4.2 Validate that start time is before end time for active days
- [x] 4.3 Disable or dim time inputs when a day is inactive
- [x] 4.4 Handle missing schedule rows with defaults

## 5. Verification

- [x] 5.1 Verify the page loads at `/bo/settings`
- [x] 5.2 Verify saving company and schedule changes works
- [x] 5.3 Verify services render read-only
- [x] 5.4 Verify the sidebar item highlights correctly on the settings page
