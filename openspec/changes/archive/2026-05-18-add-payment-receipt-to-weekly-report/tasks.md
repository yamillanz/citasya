# Tasks: add-payment-receipt-to-weekly-report

## Phase 1: Model & Service

- [x] 1.1 Add `payment_receipt_url?: string` to the `WeeklyDetailRow` interface in `app-web/src/app/core/models/weekly-report.model.ts`
- [x] 1.2 Map `payment_receipt_url` from raw appointment data in `WeeklyReportService.getEmployeeDetail()` in `app-web/src/app/core/services/weekly-report.service.ts` (line ~145, add: `payment_receipt_url: apt.payment_receipt_url || undefined`)

## Phase 2: Dialog Template & Styles

- [x] 2.1 Add "Comprobante" column header `<th>` to the table in `employee-detail-dialog.component.html` (after "Fecha pago" header)
- [x] 2.2 Add "Comprobante" column body `<td>` in the row template, displaying a receipt link (`<a>` with `pi pi-image` icon, class `receipt-link`, `target="_blank"`) when `row.payment_receipt_url` exists, or "—" when absent
- [x] 2.3 Add `.receipt-link` styles to `employee-detail-dialog.component.scss` (replicate from `appointments.component.scss`)
- [x] 2.4 Update `colspan` on empty message cell from 10 to 11

## Phase 3: Test Updates

### 3.1 Service tests (`weekly-report.service.spec.ts`)

- [x] 3.1.1 Add `is_paid`, `payment_date`, and `payment_receipt_url` fields to the `mockDetailRows` array
- [x] 3.1.2 Add test: "debe mapear payment_receipt_url desde los datos crudos"
- [x] 3.1.3 Add test: "debe mapear is_paid y payment_date desde los datos crudos"

### 3.2 Component tests (`employee-detail-dialog.component.spec.ts`)

- [x] 3.2.1 Add `payment_receipt_url` to `mockDetailData` rows 1 and 4
- [x] 3.2.2 Update CSV export test: add `'Comprobante'` to expected headers
- [x] 3.2.3 Update CSV content test: renamed to include "Comprobante", verify URL and "—" in rows
- [x] 3.2.4 Add test: "debe mostrar enlace de comprobante cuando payment_receipt_url existe" — finds 2 receipt links via `document.querySelectorAll`
- [x] 3.2.5 Add test: "debe mostrar '—' cuando payment_receipt_url no existe"
- [x] 3.2.6 Skipped — no helper method extracted; inline `@if` used instead (consistent with "Pagado" column pattern)

### 3.3 Model tests (`weekly-report.model.spec.ts`)

- [x] 3.3.1 No changes needed; `ng test` confirms no regressions

## Phase 4: CSV Export

- [x] 4.1 Add "Comprobante" to the `headers` array in `exportDetailCsv()` method
- [x] 4.2 Add receipt URL or "—" to each `rows` entry in the CSV mapping

## Phase 5: Verification

- [x] 5.1 `ng test` — all 54 tests pass (3 suites, 0 failures)
- [x] 5.2 `ng test` — employee-detail-dialog: 22 tests pass
- [x] 5.3 `ng test` — weekly-report.service: 16 tests pass
- [x] 5.4 `ng test` — weekly-report.model: 19 tests pass (no regressions)
