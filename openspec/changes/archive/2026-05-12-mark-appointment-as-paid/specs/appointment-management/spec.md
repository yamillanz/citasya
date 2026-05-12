## ADDED Requirements

### Requirement: Payment fields on appointment record
The appointment record SHALL support payment tracking with fields `is_paid`, `payment_method`, `payment_reference`, and `payment_date`.

#### Scenario: Payment fields are nullable by default
- **WHEN** an appointment is created or loaded without payment data
- **THEN** `is_paid` defaults to `false`
- **AND** `payment_method`, `payment_reference`, `payment_date` are `null`

#### Scenario: Query paid appointments
- **WHEN** the system queries appointments
- **THEN** the payment fields are included in the result and available for filtering

### Requirement: Payment action in status change drawer
The status change drawer in the appointment list SHALL support a "paid" action type with payment-specific form fields.

#### Scenario: Drawer opens in paid mode
- **WHEN** `openPaymentDrawer` is called with an appointment
- **THEN** `statusAction` is set to `'paid'`
- **AND** the drawer displays: payment method selector, reference input, Bs amount input (preloaded), and static date/time text

#### Scenario: Drawer title and buttons adapt to paid action
- **WHEN** `statusAction` is `'paid'`
- **THEN** the drawer title is "Registrar Pago"
- **AND** the action button label is "Confirmar pago"
- **AND** the action button severity is "success"

#### Scenario: Drawer footer for paid action
- **WHEN** `statusAction` is `'paid'`
- **THEN** the "Confirmar pago" button is disabled when no payment method is selected
- **AND** the "Cerrar" button closes the drawer without saving

### Requirement: Appointment list payment UI
The appointment list card SHALL display payment status for completed appointments.

#### Scenario: Paid appointment card
- **WHEN** a completed appointment has `is_paid = true`
- **THEN** the card shows a "Pagado" badge (green, check icon) next to the "Completada" badge
- **AND** no "Registrar pago" button is shown

#### Scenario: Unpaid completed appointment card
- **WHEN** a completed appointment has `is_paid = false`
- **THEN** the card shows a "Registrar pago" button below the amount info
- **AND** no "Pagado" badge is shown

### Requirement: markAsPaid service method
The AppointmentService SHALL provide a `markAsPaid` method to persist payment data.

#### Scenario: Successful markAsPaid call
- **WHEN** `markAsPaid(id, { payment_method, payment_reference, payment_amount_bs })` is called
- **THEN** the `appointments` table is updated with: `is_paid = true`, `payment_method`, `payment_reference` (if provided), `payment_amount_bs` (if provided), `payment_date = now()`
- **AND** `updated_at` is set to current timestamp

#### Scenario: markAsPaid error propagation
- **WHEN** the supabase update fails
- **THEN** the error is thrown for the caller to handle
