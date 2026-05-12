## ADDED Requirements

### Requirement: Payment status in employee detail dialog
The employee detail dialog in the weekly report SHALL display payment status and payment date for each appointment row.

#### Scenario: Paid appointment row
- **WHEN** an appointment in the detail table has `is_paid = true`
- **THEN** the "Pagado" column displays a green badge with text "Pagado"
- **AND** the "Fecha pago" column displays the payment date formatted as short date (e.g., "12 may 2026")

#### Scenario: Unpaid appointment row
- **WHEN** an appointment in the detail table has `is_paid = false` or undefined
- **THEN** the "Pagado" column displays "—"
- **AND** the "Fecha pago" column displays "—"

#### Scenario: Payment columns in CSV export
- **WHEN** the user exports the detail as CSV
- **THEN** the CSV includes "Pagado" and "Fecha pago" columns
- **AND** values are "Sí" / "No" for Pagado and formatted date / "—" for Fecha pago

#### Scenario: Payment fields in WeeklyDetailRow
- **WHEN** the system fetches employee detail
- **THEN** each `WeeklyDetailRow` includes `is_paid: boolean` and `payment_date?: string`
