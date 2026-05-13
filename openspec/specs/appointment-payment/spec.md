# appointment-payment Specification

## Purpose
TBD - created by archiving change mark-appointment-as-paid. Update Purpose after archive.
## Requirements
### Requirement: Payment fields on appointment model
The Appointment model SHALL include payment tracking fields: `is_paid` (boolean, default false), `payment_method` (nullable PaymentMethod), `payment_reference` (nullable string), and `payment_date` (nullable timestamp).

#### Scenario: New appointment defaults to unpaid
- **WHEN** a new appointment is created
- **THEN** `is_paid` is `false`
- **AND** `payment_method`, `payment_reference`, and `payment_date` are `null`

#### Scenario: Payment method type
- **WHEN** setting `payment_method` on an appointment
- **THEN** the value MUST be one of: `'cash'`, `'transfer'`, `'mobile_payment'`, `'card'`

### Requirement: Manager can mark an appointment as paid
The system SHALL allow managers to mark a completed appointment as paid via the `/bo/appointments` list view, providing payment method (required), reference number (optional), and Bs amount (optional, preloaded from `amount_in_bs`).

#### Scenario: Open payment drawer from appointment card
- **WHEN** a manager clicks "Registrar pago" on a completed unpaid appointment card
- **THEN** a drawer opens with title "Registrar Pago"
- **AND** the drawer displays fields: método de pago (p-select), n° referencia (input text), monto en Bs (p-inputNumber), fecha y hora (static text)

#### Scenario: Bs amount preloaded
- **WHEN** the payment drawer opens
- **AND** the appointment has `amount_in_bs` set
- **THEN** the monto en Bs field is pre-filled with that value

#### Scenario: Bs amount zero when not set
- **WHEN** the payment drawer opens
- **AND** the appointment does NOT have `amount_in_bs`
- **THEN** the monto en Bs field shows 0

#### Scenario: Confirm button disabled without payment method
- **WHEN** the payment drawer is open
- **AND** no payment method is selected
- **THEN** the "Confirmar pago" button is disabled

#### Scenario: Successful payment registration
- **WHEN** manager selects a payment method, optionally fills reference and amount, and clicks "Confirmar pago"
- **THEN** the system calls `markAsPaid` with: appointment id, payment_method, payment_reference (or undefined), payment_amount_bs (or undefined)
- **AND** `payment_date` is set to the current timestamp automatically
- **AND** `is_paid` is set to `true`
- **AND** a success toast is displayed: "Pago registrado"
- **AND** the drawer closes
- **AND** the appointment card updates to show "Pagado" badge instead of "Registrar pago" button

#### Scenario: Payment failure
- **WHEN** the `markAsPaid` API call fails
- **THEN** an error toast is displayed: "No se pudo registrar el pago"
- **AND** the drawer remains open for retry

#### Scenario: Saving state during payment
- **WHEN** the payment is being processed
- **THEN** the "Confirmar pago" button shows a loading spinner and text "Registrando..."
- **AND** the "Cerrar" button is disabled

#### Scenario: Close drawer without saving
- **WHEN** manager clicks "Cerrar" or the close icon in the payment drawer
- **THEN** the drawer closes without calling `markAsPaid`
- **AND** form fields are reset

### Requirement: Payment visual indicator on appointment cards
The appointment list view SHALL visually indicate whether a completed appointment has been paid.

#### Scenario: Show "Pagado" badge for paid appointments
- **WHEN** a completed appointment has `is_paid = true`
- **THEN** the card displays a green "Pagado" badge with a check icon, next to the "Completada" status badge

#### Scenario: Show "Registrar pago" button for unpaid appointments
- **WHEN** a completed appointment has `is_paid = false`
- **THEN** the card displays a "Registrar pago" button with `pi-money-bill` icon

#### Scenario: No payment UI for non-completed appointments
- **WHEN** an appointment has status `pending`, `cancelled`, or `no_show`
- **THEN** neither the "Pagado" badge nor the "Registrar pago" button is displayed

#### Scenario: Calendar view omits payment UI
- **WHEN** the manager switches to calendar view
- **THEN** payment badges and buttons are NOT shown on calendar items

### Requirement: Payment receipt image on mark-as-paid
The payment drawer SHALL allow the manager to optionally attach a receipt/voucher image when registering a payment to an employee.

#### Scenario: Upload receipt when registering payment
- **GIVEN** a manager opens the payment drawer for a completed unpaid appointment
- **WHEN** the drawer displays the payment form
- **THEN** an "Adjuntar comprobante de pago" section is displayed below the "Fecha y hora" field
- **AND** the section contains a file upload area that accepts PNG and JPG images up to 2MB
- **AND** the field is optional (no validation error if empty)

#### Scenario: Preview payment receipt before confirming
- **WHEN** the manager selects an image file in the payment drawer
- **THEN** a thumbnail preview of the selected image is shown
- **AND** a "Remove" button appears to remove the selected image
- **AND** the file name and size are displayed below the preview

#### Scenario: File type validation in payment drawer
- **WHEN** the manager selects a file that is not PNG or JPG in the payment drawer
- **THEN** the system displays an error: "Solo se permiten imágenes PNG o JPG"
- **AND** the file is rejected

#### Scenario: File size validation in payment drawer
- **WHEN** the manager selects a file larger than 2MB in the payment drawer
- **THEN** the system displays an error: "La imagen no debe superar 2MB"
- **AND** the file is rejected

#### Scenario: Confirm payment with receipt
- **WHEN** the manager confirms payment with a receipt image attached
- **THEN** the system uploads the image to Supabase Storage before marking the appointment as paid
- **AND** the `payment_receipt_url` field on the appointment is set to the public URL of the uploaded image
- **AND** the appointment is marked as paid with payment details

#### Scenario: Confirm payment without receipt
- **WHEN** the manager confirms payment without attaching a receipt
- **THEN** the system marks the appointment as paid as before
- **AND** the `payment_receipt_url` field remains null

#### Scenario: Upload failure during payment
- **WHEN** the image upload to Supabase Storage fails during payment registration
- **THEN** the system displays an error: "Error al subir el comprobante. Intente de nuevo."
- **AND** the appointment is NOT marked as paid (the entire operation fails)
- **AND** the drawer remains open for retry

#### Scenario: Payment receipt thumbnail on appointment card
- **WHEN** a paid appointment has a `payment_receipt_url` value
- **THEN** the appointment card displays a small receipt icon/thumbnail next to the "Pagado" badge
- **AND** clicking the thumbnail opens the payment receipt image in a new tab

### Requirement: markAsPaid service method updated for receipt
The `markAsPaid` method SHALL accept an optional `payment_receipt_url` parameter.

#### Scenario: markAsPaid with receipt URL
- **WHEN** `markAsPaid(id, { payment_method, payment_receipt_url })` is called with a receipt URL
- **THEN** the `appointments` table is updated with `payment_receipt_url` set to the provided URL
- **AND** all other payment fields are updated as before

#### Scenario: markAsPaid without receipt URL
- **WHEN** `markAsPaid(id, { payment_method })` is called without a receipt URL
- **THEN** the `payment_receipt_url` field remains null (or unchanged)
- **AND** all other payment fields are updated as before

