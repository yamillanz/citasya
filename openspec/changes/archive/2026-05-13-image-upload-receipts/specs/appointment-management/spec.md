# appointment-management — Delta Spec (image-upload-receipts)

## ADDED Requirements

### Requirement: Receipt image on appointment completion
The appointment completion drawer SHALL allow the manager to optionally attach a receipt/voucher image when marking an appointment as completed.

#### Scenario: Upload receipt when completing appointment
- **GIVEN** a manager opens the status change drawer with action 'completed'
- **WHEN** the drawer displays the completion form
- **THEN** an "Adjuntar comprobante" section is displayed below the "Observaciones" field
- **AND** the section contains a file upload area that accepts PNG and JPG images up to 2MB
- **AND** the field is optional (no validation error if empty)

#### Scenario: Preview receipt before confirming
- **WHEN** the manager selects an image file
- **THEN** a thumbnail preview of the selected image is shown
- **AND** a "Remove" button appears to remove the selected image
- **AND** the file name and size are displayed below the preview

#### Scenario: File type validation on selection
- **WHEN** the manager selects a file that is not PNG or JPG
- **THEN** the system displays an error: "Solo se permiten imágenes PNG o JPG"
- **AND** the file is rejected (no preview shown)

#### Scenario: File size validation on selection
- **WHEN** the manager selects a file larger than 2MB
- **THEN** the system displays an error: "La imagen no debe superar 2MB"
- **AND** the file is rejected (no preview shown)

#### Scenario: Confirm completion with receipt
- **WHEN** the manager confirms completion with a receipt image attached
- **THEN** the system uploads the image to Supabase Storage before updating the appointment status
- **AND** the `receipt_url` field on the appointment is set to the public URL of the uploaded image
- **AND** the appointment status is updated to 'completed' with financial data

#### Scenario: Confirm completion without receipt
- **WHEN** the manager confirms completion without attaching a receipt
- **THEN** the system updates the appointment status to 'completed' as before
- **AND** the `receipt_url` field remains null

#### Scenario: Upload failure during completion
- **WHEN** the image upload to Supabase Storage fails
- **THEN** the system displays an error: "Error al subir el comprobante. Intente de nuevo."
- **AND** the appointment status is NOT updated (the entire operation fails)
- **AND** the drawer remains open for retry

#### Scenario: Receipt thumbnail on appointment card
- **WHEN** a completed appointment has a `receipt_url` value
- **THEN** the appointment card displays a small receipt icon/thumbnail indicating a receipt is attached
- **AND** clicking the thumbnail opens the receipt image in a new tab

### Requirement: Appointment model includes receipt fields
The Appointment interface SHALL include `receipt_url` and `payment_receipt_url` fields.

#### Scenario: Receipt fields on model
- **WHEN** an appointment is loaded from the database
- **THEN** the `receipt_url` field contains the public URL of the completion receipt (or null)
- **AND** the `payment_receipt_url` field contains the public URL of the payment receipt (or null)

#### Scenario: Null receipt fields by default
- **WHEN** a new appointment is created
- **THEN** `receipt_url` is null
- **AND** `payment_receipt_url` is null