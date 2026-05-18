# Design: add-payment-receipt-to-weekly-report

## Architecture Decision

**Approach**: Add a new table column "Comprobante" in the employee detail dialog's appointments table, reusing the existing `.receipt-link` visual pattern from the `appointments` component.

### Why this approach
- **Consistency**: The `.receipt-link` pattern already exists in `appointments.component.scss` (lines 412-434), providing a proven, tested visual for receipt links
- **Minimal change**: The `payment_receipt_url` is already fetched from Supabase (the query uses `*`), it's just discarded during mapping. Adding it to the model and template is a small change
- **No new dependencies**: Uses existing `pi pi-image` icon from PrimeIcons, already available

### Alternatives considered
1. **Inline thumbnail preview**: Rejected — too space-heavy for a table with 10+ columns; adds image loading complexity and layout shift
2. **Modal/dialog with image viewer**: Rejected — over-engineered for this use case; a simple new-tab link is sufficient and consistent with the appointments card behavior
3. **Merge into "Pagado" column**: Rejected — mixing badge and link in one cell reduces clarity; separate column is more explicit

## Data Flow

```
Supabase (appointments.payment_receipt_url)
  → WeeklyReportService.getEmployeeDetail() (maps to WeeklyDetailRow.payment_receipt_url)
    → EmployeeDetailDialogComponent.detailData() signal
      → Template: *ngFor row → receipt link or "—"
      → CSV export: URL string or "—"
```

## File Changes

### Production Code

| File | Action | Purpose |
|------|--------|---------|
| `app-web/src/app/core/models/weekly-report.model.ts` | MODIFY | Add `payment_receipt_url?: string` to `WeeklyDetailRow` (line 24) |
| `app-web/src/app/core/services/weekly-report.service.ts` | MODIFY | Map `payment_receipt_url` in `getEmployeeDetail()` (line 145) |
| `app-web/src/app/features/backoffice/manager/reports/weekly/employee-detail-dialog.component.ts` | MODIFY | Add receipt URL to CSV export columns (lines 89, 101) |
| `app-web/src/app/features/backoffice/manager/reports/weekly/employee-detail-dialog.component.html` | MODIFY | Add "Comprobante" column header and body (lines 79, 107, 113 colspan) |
| `app-web/src/app/features/backoffice/manager/reports/weekly/employee-detail-dialog.component.scss` | MODIFY | Add `.receipt-link` styles (replicate from appointments SCSS) |

### Test Code

| File | Action | Purpose |
|------|--------|---------|
| `weekly-report.service.spec.ts` | MODIFY | Add `is_paid`, `payment_date`, `payment_receipt_url` to `mockDetailRows`; add 2 new test cases for mapping verification |
| `employee-detail-dialog.component.spec.ts` | MODIFY | Add `payment_receipt_url` to `mockDetailData`; update CSV assertions to include "Comprobante"; add 3 new test cases for receipt column rendering and behavior |
| `weekly-report.model.spec.ts` | NO CHANGE | No new helper function added; existing tests remain sufficient |

### Specs

| File | Action | Purpose |
|------|--------|---------|
| `openspec/specs/weekly-report/spec.md` | MODIFY | Add payment receipt requirement (sync after implementation) |

## No Database Changes
The `payment_receipt_url` column already exists in the `appointments` table (migration `20260513_add_receipt_url_fields.sql`). No new migration is needed.

## Visual Pattern Reference
From `appointments.component.scss` (lines 412-434):
```scss
.receipt-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: rgba(93, 109, 126, 0.08);
  color: var(--color-text-muted);
  text-decoration: none;
  margin-left: var(--space-xs);
  transition: all var(--duration-fast) ease;

  i {
    font-size: 0.75rem;
    margin: 0;
  }

  &:hover {
    background: var(--color-sage-pale);
    color: var(--color-sage-dark);
  }
}
```
The same `.receipt-link` class shall be added to the dialog's SCSS file.

## Column Positioning
The "Comprobante" column is added AFTER "Fecha pago" (which is currently the last column, position 10). New position: column 11.

## Test Strategy

### Gap analysis
The existing tests do NOT cover `payment_receipt_url` at all:
- **Service mock data** lacks `is_paid`, `payment_date`, and `payment_receipt_url` entirely
- **Component mock data** has `is_paid` and `payment_date` but NOT `payment_receipt_url`
- **CSV assertions** don't include "Comprobante" column
- **No rendering test** verifies receipt link presence/absence in the DOM

### New tests added (9 total)
1. Service: "debe mapear payment_receipt_url desde los datos crudos" — verifies correct field transfer
2. Service: "debe mapear is_paid y payment_date desde los datos crudos" — fills existing coverage gap
3. Component: updated CSV export header assertion to include `'Comprobante'`
4. Component: updated CSV column content test to verify URL and "—" values
5. Component: "debe mostrar enlace de comprobante cuando payment_receipt_url existe" — DOM rendering test
6. Component: "debe mostrar '—' cuando payment_receipt_url no existe" — DOM rendering test
7. Component: "getReceiptLabel debe retornar la URL cuando existe y '—' cuando no" — helper method unit test (if extracted)
