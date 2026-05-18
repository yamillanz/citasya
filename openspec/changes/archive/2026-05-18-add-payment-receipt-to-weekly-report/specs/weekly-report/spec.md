# weekly-report Delta Spec

## ADDED Requirements

### Requirement: Payment receipt in employee detail dialog
The employee detail dialog in the weekly report SHALL display a link to the payment receipt image (`payment_receipt_url`) for each appointment row, so that managers can verify payment evidence from the report.

#### Scenario: Appointment with payment receipt
- **WHEN** an appointment in the detail table has `payment_receipt_url` set (non-null, non-empty)
- **THEN** the "Comprobante" column displays a clickable icon link (icon: `pi pi-image`)
- **AND** clicking the link opens the payment receipt image in a new browser tab
- **AND** the icon uses the same `.receipt-link` visual pattern as the appointments list view (subtle icon button with hover effect)

#### Scenario: Appointment without payment receipt
- **WHEN** an appointment in the detail table does NOT have `payment_receipt_url` (null or empty)
- **THEN** the "Comprobante" column displays "—" (no icon, no link)

#### Scenario: Payment receipt in CSV export
- **WHEN** the user exports the detail as CSV
- **THEN** the CSV includes a "Comprobante" column
- **AND** the value is the full `payment_receipt_url` when present, or "—" when absent

### Requirement: Payment receipt URL in WeeklyDetailRow
The `WeeklyDetailRow` interface SHALL include the `payment_receipt_url` field.

#### Scenario: Data fetching includes receipt URL
- **WHEN** the system fetches employee detail via `getEmployeeDetail()`
- **THEN** each `WeeklyDetailRow` includes `payment_receipt_url?: string` mapped from the `appointments.payment_receipt_url` column
