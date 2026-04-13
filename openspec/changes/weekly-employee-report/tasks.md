## 1. Database & Models

- [x] 1.1 Create Supabase migration: add `commission_percentage numeric(5,2) NOT NULL DEFAULT 0` to `services` table
- [x] 1.2 Update `service.model.ts`: add `commission_percentage: number` field to `Service` interface
- [x] 1.3 Create `weekly-report.model.ts` in `core/models/` with `WeeklySummaryRow` and `WeeklyDetailRow` interfaces

## 2. Shared Services

- [x] 2.1 Create `CsvExportService` in `shared/services/csv-export.service.ts` with `exportCsv(filename, headers, rows)` method (BOM prefix, quote escaping, matching existing pattern from employee-history)
- [x] 2.2 Create `WeeklyReportService` in `core/services/weekly-report.service.ts` with methods: `getWeeklySummary(companyId, startDate, endDate, employeeId?)`, `getEmployeeDetail(companyId, employeeId, startDate, endDate)`
- [x] 2.3 Implement commission calculation logic in `WeeklyReportService`: proportional method — for each appointment's services, calculate `(servicePrice / totalPrice) * amountCollected * (commissionPercentage / 100)`, sum per employee

## 3. Weekly Report Component

- [x] 3.1 Create `weekly-report.component.ts` in `features/backoffice/manager/reports/weekly/` with signals for: dateRange, selectedEmployee, summaryData, loading, employees list
- [x] 3.2 Create `weekly-report.component.html` with: header (title + export button), filters row (p-calendar date range + p-dropdown employee filter), p-table summary (Empleado | Total Citas | Total Monto | Comisión), totals footer
- [x] 3.3 Implement `getStartOfWeek()` and `getEndOfWeek()` helpers for default Monday-Sunday date range
- [x] 3.4 Implement `loadSummary()` method calling `WeeklyReportService.getWeeklySummary()` on date/employee filter changes
- [x] 3.5 Implement `exportSummaryCsv()` using `CsvExportService`
- [x] 3.6 Add empty state for no data scenarios
- [x] 3.7 Add loading state with skeleton during data fetch

## 4. Employee Detail Dialog

- [x] 4.1 Create `employee-detail-dialog.component.ts` with signals for: appointmentDetail list, loading, stats (completed/pending/cancelled/no_show counts)
- [x] 4.2 Create `employee-detail-dialog.component.html` with: dialog header (employee name + date range), stats cards row, p-table with appointment details (Fecha | Hora | Cliente | Servicios | Monto | Comisión | Estado), p-tag colors per status
- [x] 4.3 Implement `loadDetail()` method calling `WeeklyReportService.getEmployeeDetail()` when dialog opens
- [x] 4.4 Implement `exportDetailCsv()` using `CsvExportService`
- [x] 4.5 Add dialog open trigger from summary table row click

## 5. Routing & Navigation

- [x] 5.1 Add route `{ path: 'reports/weekly', component: WeeklyReportComponent }` to `manager.routes.ts`
- [x] 5.2 Add "Reportes" menu item with `pi pi-chart-bar` icon and `/bo/reports/weekly` routerLink to `backoffice.component.ts` sidebar menuItems array

## 6. Verification

- [ ] 6.1 Verify the report loads at `/bo/reports/weekly` with manager auth (requires running app + auth)
- [ ] 6.2 Verify date range filter defaults to current week (Monday-Sunday) and updates data on change
- [ ] 6.3 Verify employee filter dropdown shows all active employees and filters correctly
- [ ] 6.4 Verify clicking an employee row opens the detail modal with correct data
- [ ] 6.5 Verify CSV export downloads correct files with UTF-8 BOM
- [ ] 6.6 Verify "Reportes" sidebar item highlights when on the weekly report page
- [x] 6.7 Run `npm run build` to verify no errors — BUILD SUCCESSFUL