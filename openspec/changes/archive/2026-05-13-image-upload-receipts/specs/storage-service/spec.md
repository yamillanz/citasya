# storage-service — New Spec (image-upload-receipts)

## ADDED Requirements

### Requirement: Supabase Storage bucket for receipts
The system SHALL have a Supabase Storage bucket named `receipts` for storing receipt/voucher images.

#### Scenario: Bucket creation
- **GIVEN** the Supabase project is set up
- **WHEN** the migration is applied
- **THEN** a Storage bucket named `receipts` exists
- **AND** the bucket is configured as non-public (files require authenticated access via signed URLs or RLS)

#### Scenario: Folder structure
- **WHEN** a receipt image is uploaded
- **THEN** the file is stored under the path `receipts/{company_id}/{appointment_id}_{type}.{ext}`
- **WHERE** `type` is either `completion` or `payment`
- **AND** `ext` is the original file extension (jpg or png)

#### Scenario: RLS policy — managers can upload
- **GIVEN** a user with role 'manager' authenticated in the system
- **WHEN** the user attempts to upload a receipt to their company's folder
- **THEN** the upload is allowed if the user's `company_id` matches the folder prefix
- **AND** the upload is denied if the company ID does not match

#### Scenario: RLS policy — authenticated users can view
- **GIVEN** an authenticated user in the system
- **WHEN** the user attempts to read a receipt image
- **THEN** the read is allowed if the user belongs to the same company as the receipt
- **AND** the read is denied otherwise

#### Scenario: RLS policy — public access denied
- **GIVEN** an unauthenticated request
- **WHEN** the request attempts to access any receipt image
- **THEN** access is denied

### Requirement: StorageService for file operations
The system SHALL provide a `StorageService` in `core/services/` that wraps Supabase Storage operations for receipt images.

#### Scenario: Upload a receipt image
- **WHEN** `StorageService.uploadReceipt(file, companyId, appointmentId, type)` is called
- **THEN** the service validates the file type (PNG/JPG only) and size (max 2MB)
- **AND** if valid, uploads the file to `receipts/{companyId}/{appointmentId}_{type}.{ext}`
- **AND** returns the public URL of the uploaded file
- **AND** if invalid, throws an error with a descriptive message

#### Scenario: Upload with invalid file type
- **WHEN** `uploadReceipt` is called with a non-PNG/JPG file
- **THEN** the service throws an error: "Solo se permiten imágenes PNG o JPG"

#### Scenario: Upload with file too large
- **WHEN** `uploadReceipt` is called with a file larger than 2MB
- **THEN** the service throws an error: "La imagen no debe superar 2MB"

#### Scenario: Delete a receipt image
- **WHEN** `StorageService.deleteReceipt(path)` is called
- **THEN** the service removes the file from the `receipts` bucket
- **AND** returns void on success
- **AND** throws an error on failure

#### Scenario: Get public URL for a receipt
- **WHEN** `StorageService.getReceiptUrl(companyId, appointmentId, type)` is called
- **THEN** the service returns the public URL for the receipt image
- **AND** returns null if no file exists at that path

### Requirement: ImageUploadComponent for receipt selection
The system SHALL provide a reusable `ImageUploadComponent` in `shared/components/` for selecting, previewing, and uploading receipt images.

#### Scenario: Component renders upload area
- **WHEN** the `ImageUploadComponent` is rendered
- **THEN** it displays a dashed-border upload area with text "Arrastra, pega o haz clic para seleccionar una imagen"
- **AND** an icon indicating image upload
- **AND** a note "PNG o JPG, máximo 2MB · También puedes pegar desde el portapapeles"

#### Scenario: Component accepts file via click
- **WHEN** the user clicks the upload area
- **THEN** a file picker dialog opens
- **AND** the file picker is filtered to accept PNG and JPG files only

#### Scenario: Component accepts file via drag-and-drop
- **WHEN** the user drags a PNG/JPG file onto the upload area
- **THEN** the file is accepted and previewed

#### Scenario: Component rejects drag-and-drop of invalid file
- **WHEN** the user drags a non-PNG/JPG file onto the upload area
- **THEN** the upload area shows a red border briefly
- **AND** an error message appears: "Solo se permiten imágenes PNG o JPG"

#### Scenario: Component accepts file via clipboard paste
- **WHEN** the user has an image copied to the clipboard (e.g., screenshot, copied image)
- **AND** the user presses Ctrl+V (or Cmd+V on Mac) while the upload area or its container has focus
- **THEN** the pasted image is accepted and previewed
- **AND** the same validation rules apply (PNG/JPG only, max 2MB)

#### Scenario: Clipboard paste with non-image data
- **WHEN** the user presses Ctrl+V (or Cmd+V) with non-image data in the clipboard (e.g., text)
- **THEN** the paste event is ignored
- **AND** no error message is shown (only image data is processed)

#### Scenario: Clipboard paste with invalid image type
- **WHEN** the user pastes an image from clipboard that is not PNG or JPG (e.g., GIF, BMP, WebP)
- **THEN** the component displays an error: "Solo se permiten imágenes PNG o JPG"
- **AND** the paste is rejected (no preview shown)

#### Scenario: Clipboard paste with image exceeding size limit
- **WHEN** the user pastes an image from clipboard that exceeds 2MB
- **THEN** the component displays an error: "La imagen no debe superar 2MB"
- **AND** the paste is rejected (no preview shown)

#### Scenario: Clipboard paste visual feedback
- **WHEN** the user pastes an image successfully from the clipboard
- **THEN** the upload area briefly shows a visual highlight (e.g., green border flash)
- **AND** the preview appears with the pasted image
- **AND** the file name displays as "Imagen pegada" (since clipboard images have no file name)

#### Scenario: Component shows preview after selection
- **WHEN** a valid image file is selected (via click, drag-and-drop, or paste)
- **THEN** the component shows a thumbnail preview of the image
- **AND** displays the file name and size
- **AND** shows a "Remove" button to clear the selection

#### Scenario: Component removes preview
- **WHEN** the user clicks the "Remove" button
- **THEN** the preview is cleared
- **AND** the upload area returns to its initial state
- **AND** the `imageRemoved` output is emitted

#### Scenario: Component emits selected file
- **WHEN** a valid image file is selected (via click, drag-and-drop, or paste)
- **THEN** the `imageSelected` output emits the `File` object
- **AND** the parent component can use this file for upload

#### Scenario: Component displays existing image
- **WHEN** the `currentImageUrl` input is provided with an existing URL
- **THEN** the component displays the existing image as a preview
- **AND** shows a "Remove" button to remove the existing image

#### Scenario: Component shows upload progress
- **WHEN** the `uploading` input is set to true
- **THEN** the component displays a progress indicator
- **AND** the upload area is disabled (no new file selection, no paste)

#### Scenario: Component shows upload error
- **WHEN** the `error` input is set to an error message
- **THEN** the component displays the error message in red below the upload area
