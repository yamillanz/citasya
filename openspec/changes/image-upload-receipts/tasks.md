# Tasks: Image Upload for Receipts/Vouchers

## Phase 1: Database & Storage Setup

- [x] 1.1 Create migration `20260513_add_receipt_url_fields.sql` adding `receipt_url TEXT` and `payment_receipt_url TEXT` columns to `appointments` table
- [x] 1.2 Create migration `20260513_create_receipts_bucket.sql` creating the `receipts` Storage bucket with RLS policies (insert, select, delete scoped to company_id)
- [x] 1.3 Apply migrations to local Supabase and verify bucket creation and RLS policies work
- [x] 1.4 Update `Appointment` interface in `app-web/src/app/core/models/appointment.model.ts` to add `receipt_url?: string` and `payment_receipt_url?: string` fields

## Phase 2: StorageService

- [x] 2.1 Create `app-web/src/app/core/services/storage.service.ts` with `StorageService` class
- [x] 2.2 Implement `uploadReceipt(file: File, companyId: string, appointmentId: string, type: 'completion' | 'payment'): Promise<string>` method
  - Validate file type (PNG/JPG only)
  - Validate file size (max 2MB)
  - Build storage path: `receipts/{companyId}/{appointmentId}_{type}.{ext}`
  - Upload to Supabase Storage using `supabase.storage.from('receipts').upload()`
  - Handle upsert (replace if exists) using `upsert: true`
  - Return public URL using `supabase.storage.from('receipts').getPublicUrl()`
- [x] 2.3 Implement `deleteReceipt(path: string): Promise<void>` method
- [x] 2.4 Implement `getReceiptUrl(companyId: string, appointmentId: string, type: 'completion' | 'payment'): string` method
- [x] 2.5 Add `StorageService` to provider configuration (already `providedIn: 'root'`)

## Phase 3: ImageUploadComponent

- [x] 3.1 Create `app-web/src/app/shared/components/image-upload/image-upload.component.ts`
  - Standalone component with `ChangeDetectionStrategy.OnPush`
  - Inputs: `currentImageUrl` (signal input), `uploading` (signal input), `error` (signal input)
  - Outputs: `imageSelected` (emits File), `imageRemoved` (emits void)
  - Local state: `previewUrl` signal, `fileName` signal, `fileSize` signal, `selectedFile` signal, `showPasteFeedback` signal
  - Methods: `onFileSelected(event)`, `onDragOver(event)`, `onDrop(event)`, `onPaste(event)`, `removeImage()`
  - Private method: `validateFile(file: File)` — validates type and size, throws descriptive errors
  - Private method: `formatFileSize(bytes: number)` — returns human-readable size string
  - **Clipboard paste**: `@HostListener('paste', ['$event'])` on the component
    - Extract image from `event.clipboardData.items` where `type.startsWith('image/')`
    - Call `item.getAsFile()` to get File object
    - Run same validation as file picker (PNG/JPG, max 2MB)
    - Set `fileName` to "Imagen pegada" for clipboard images
    - Show green border flash feedback via `showPasteFeedback` signal (1 second)
    - Silently ignore non-image clipboard data
- [x] 3.2 Create `app-web/src/app/shared/components/image-upload/image-upload.component.html`
  - Upload zone with drag-and-drop support AND paste support (`tabindex="0"` for focus)
  - Text: "Arrastra, pega o haz clic para seleccionar una imagen"
  - Hint: "PNG o JPG, máximo 2MB · También puedes pegar desde el portapapeles"
  - Preview section with thumbnail, file info ("Imagen pegada" for clipboard), remove button
  - Hidden file input triggered by click
  - Loading state with progress indicator
  - Error message display
  - Paste feedback: green border flash animation on successful paste
- [x] 3.3 Create `app-web/src/app/shared/components/image-upload/image-upload.component.scss`
  - Upload zone: dashed border, cream background, rounded corners, hover state
  - Paste feedback: green border flash animation (`@keyframes pasteFlash`)
  - Preview: white card, shadow, 80x80px thumbnail
  - Responsive layout
  - Follow design tokens from STYLES.MD
- [x] 3.4 Add `ImageUploadComponent` to the exports of any shared module or make it importable as standalone

## Phase 4: AppointmentService Updates

- [x] 4.1 Update `updateStatus()` method in `appointment.service.ts` to accept optional `receiptUrl?: string` parameter
  - Add `receipt_url` to the update data when provided
- [x] 4.2 Update `markAsPaid()` method in `appointment.service.ts` to accept `payment_receipt_url` in the `paymentData` parameter
  - Add `payment_receipt_url` to the update data when provided
- [x] 4.3 Update the `PaymentMethod` type or payment data interface to include `payment_receipt_url?: string`

## Phase 5: Integration — Completion Drawer

- [x] 5.1 Add `StorageService` injection to `AppointmentsComponent`
- [x] 5.2 Add image upload state signals to `AppointmentsComponent`:
  - `selectedCompletionReceipt = signal<File | null>(null)`
  - `completionReceiptError = signal<string | null>(null)`
  - `uploadingCompletionReceipt = signal(false)`
- [x] 5.3 Add `<app-image-upload>` component to the completion drawer section in `appointments.component.html`
  - Place after "Observaciones" textarea
  - Bind `imageSelected` output to set `selectedCompletionReceipt`
  - Bind `imageRemoved` output to clear `selectedCompletionReceipt`
  - Bind `uploading` to `uploadingCompletionReceipt`
  - Bind `error` to `completionReceiptError`
- [x] 5.4 Update `confirmStatusChange()` method:
  - If `selectedCompletionReceipt()` is set, call `storageService.uploadReceipt()` first
  - On upload success, pass the returned URL to `appointmentService.updateStatus()`
  - On upload failure, set `completionReceiptError` and abort (don't update status)
  - Reset `selectedCompletionReceipt` and `completionReceiptError` on drawer close
- [x] 5.5 Add `ImageUploadComponent` to `AppointmentsComponent` imports array

## Phase 6: Integration — Payment Drawer

- [x] 6.1 Add payment receipt state signals to `AppointmentsComponent`:
  - `selectedPaymentReceipt = signal<File | null>(null)`
  - `paymentReceiptError = signal<string | null>(null)`
  - `uploadingPaymentReceipt = signal(false)`
- [x] 6.2 Add `<app-image-upload>` component to the payment drawer section in `appointments.component.html`
  - Place after "Fecha y hora" section
  - Bind outputs and inputs similarly to completion drawer
- [x] 6.3 Update `confirmPayment()` method:
  - If `selectedPaymentReceipt()` is set, call `storageService.uploadReceipt()` first
  - On upload success, pass the returned URL to `appointmentService.markAsPaid()`
  - On upload failure, set `paymentReceiptError` and abort
  - Reset `selectedPaymentReceipt` and `paymentReceiptError` on drawer close
- [x] 6.4 Update `openPaymentDrawer()` to reset receipt-related signals
- [x] 6.5 Update `closeDrawer()` to reset all receipt-related signals

## Phase 7: Receipt Display on Appointment Cards

- [x] 7.1 Add receipt indicator to appointment cards in `appointments.component.html`
  - Show a small receipt icon (pi-paperclip or pi-image) when `apt.receipt_url` exists
  - Show a small receipt icon when `apt.payment_receipt_url` exists (next to "Pagado" badge)
  - Clicking the icon opens the receipt URL in a new tab
- [x] 7.2 Style the receipt indicator to match the app's design system (small, subtle, not overwhelming)

## Phase 8: Testing & Verification

- [x] 8.1 Test completion flow with receipt image upload (PNG)
- [x] 8.2 Test completion flow with receipt image upload (JPG)
- [x] 8.3 Test completion flow without receipt image (optional field)
- [x] 8.4 Test payment flow with receipt image upload
- [x] 8.5 Test payment flow without receipt image
- [x] 8.6 Test file type validation (reject non-PNG/JPG)
- [x] 8.7 Test file size validation (reject >2MB)
- [x] 8.8 Test upload failure handling (error toast, drawer stays open)
- [x] 8.9 Test receipt icon display on appointment cards
- [x] 8.10 Test drag-and-drop file selection
- [x] 8.11 Test clipboard paste (Ctrl+V / Cmd+V) with screenshot image
- [x] 8.12 Test clipboard paste with copied image from browser
- [x] 8.13 Test clipboard paste with non-image data (text) — should be silently ignored
- [x] 8.14 Test clipboard paste with invalid image type (GIF, BMP) — should show error
- [x] 8.15 Test clipboard paste with image >2MB — should show error
- [x] 8.16 Test paste visual feedback (green border flash)
- [x] 8.17 Test remove image functionality
- [x] 8.18 Test RLS policies (manager can upload to own company, cannot upload to other company)
- [x] 8.19 Test existing receipt display when `currentImageUrl` is provided
- [x] 8.20 Test that upload zone is disabled during upload (no click, no drop, no paste)
