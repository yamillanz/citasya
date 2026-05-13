# appointment-payment — Delta Spec (image-upload-receipts)

## ADDED Requirements

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