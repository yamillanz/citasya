# Design: Image Upload for Receipts/Vouchers

## Architecture Decisions

### Decision 1: Separate receipt_url and payment_receipt_url fields
**Chose**: Two distinct columns on `appointments` table
**Over**: A single `receipts` junction table or JSON array column
**Because**: The two receipt types serve different purposes (completion evidence vs. payment evidence), are uploaded at different times in the workflow, and a simple URL column is the simplest approach that meets current needs. A junction table would be over-engineering for a single optional image per action.

### Decision 2: Reusable StorageService
**Chose**: A dedicated `StorageService` in `core/services/`
**Over**: Inline upload logic in components or a generic file service
**Because**: The upload logic (validation, path construction, Supabase Storage API calls) will be needed in at least two places (completion drawer, payment drawer) and potentially in future features (employee photos, company logos). A dedicated service follows SRP and enables reuse.

### Decision 3: Reusable ImageUploadComponent
**Chose**: A standalone `ImageUploadComponent` in `shared/components/`
**Over**: Inline upload UI in each drawer
**Because**: The same upload UI (drag-and-drop, clipboard paste, preview, validation, remove) is needed in both drawers. A reusable component avoids duplication and ensures consistent UX. The component handles only file selection and preview — the actual upload is delegated to the parent via outputs.

### Decision 4: Upload-then-save pattern
**Chose**: Upload image to Storage first, then save the URL to the database in the same transaction as the status/payment update
**Over**: Save appointment first, then upload image
**Because**: We want atomicity — if the image upload fails, the appointment status/payment should not be saved. If the DB update fails after upload, we have an orphaned image which is acceptable (can be cleaned up later). This avoids the complexity of two-phase commits.

### Decision 5: Company-scoped storage paths
**Chose**: `receipts/{company_id}/{appointment_id}_{type}.{ext}`
**Over**: Flat storage or user-scoped paths
**Because**: Company-scoped paths enable simple RLS policies (check if user's company_id matches the folder), make it easy to list all receipts for a company, and provide natural data isolation between tenants.

### Decision 6: PrimeNG FileUpload vs Custom Component
**Chose**: Custom component with native drag-and-drop and clipboard paste
**Over**: PrimeNG `p-fileUpload`
**Because**: PrimeNG's FileUpload is designed for multiple file uploads and has a heavy UI that doesn't match the app's design system. A custom component gives us full control over the UX (single file, preview, drag-and-drop zone, clipboard paste) and integrates cleanly with the existing drawer patterns.

### Decision 7: Clipboard paste via paste event listener
**Chose**: Listen to `paste` event on the component's host element and extract image from `clipboardData`
**Over**: Using a hidden contenteditable div or a third-party library
**Because**: The Clipboard API (`paste` event with `clipboardData.items`) is well-supported in modern browsers and provides direct access to image data from the clipboard. A `contenteditable` div would add unnecessary complexity and accessibility issues. Third-party libraries add bundle weight for a feature that can be implemented in ~30 lines of code.

**Implementation approach for clipboard paste:**
1. Add a `@HostListener('paste', ['$event'])` on the component
2. Iterate `event.clipboardData.items` to find an item with `type.startsWith('image/')`
3. Call `item.getAsFile()` to get a `File` object
4. Run the same validation (PNG/JPG, max 2MB) as file picker and drag-and-drop
5. If valid, set the preview and emit `imageSelected`
6. If invalid, show the same error messages as other input methods
7. For clipboard images, display file name as "Imagen pegada" since clipboard data has no file name
8. Add `tabindex="0"` to the upload zone so it can receive focus and paste events
9. Show visual feedback (green border flash) on successful paste

## Data Flow

### Completion Flow (with receipt)
```
1. Manager opens "Completar" drawer
2. Manager fills in amount, exchange rate, observations
3. Manager optionally selects a receipt image (click, drag-and-drop, or Ctrl+V paste)
   → ImageUploadComponent shows preview
4. Manager clicks "Confirmar"
5. IF image selected:
   a. StorageService.uploadReceipt(file, companyId, appointmentId, 'completion')
   b. Supabase Storage stores file at: receipts/{companyId}/{appointmentId}_completion.jpg
   c. Returns public URL
6. AppointmentService.updateStatus(id, 'completed', amount, rate, bs, observations, receiptUrl?)
7. Drawer closes, success toast shown
```

### Payment Flow (with receipt)
```
1. Manager opens "Registrar pago" drawer
2. Manager selects payment method, fills reference/amount
3. Manager optionally selects a payment receipt image (click, drag-and-drop, or Ctrl+V paste)
   → ImageUploadComponent shows preview
4. Manager clicks "Confirmar pago"
5. IF image selected:
   a. StorageService.uploadReceipt(file, companyId, appointmentId, 'payment')
   b. Supabase Storage stores file at: receipts/{companyId}/{appointmentId}_payment.jpg
   c. Returns public URL
6. AppointmentService.markAsPaid(id, { payment_method, payment_reference, payment_amount_bs, payment_receipt_url })
7. Drawer closes, success toast shown
```

### Clipboard Paste Flow
```
1. User copies an image to clipboard (screenshot, right-click > Copy Image, etc.)
2. User clicks on the upload zone (gives it focus) or the zone already has focus
3. User presses Ctrl+V (Cmd+V on Mac)
4. Component's paste handler fires:
   a. Extract clipboard items from event.clipboardData
   b. Find item with type starting with 'image/'
   c. Get File object via item.getAsFile()
   d. Validate: PNG/JPG only, max 2MB
   e. If valid: show preview, emit imageSelected(File)
   f. If invalid: show error message
5. If no image in clipboard: ignore the paste event silently
```

### Error Flow
```
1. Image upload fails → error toast, drawer stays open, user can retry
2. DB update fails after successful upload → error toast, orphaned image (acceptable)
3. Invalid file type/size → rejected at component level, no API call
4. Clipboard paste with non-image data → silently ignored
5. Clipboard paste with invalid image type → error message shown
```

## File Changes

### New Files
| File | Purpose |
|------|---------|
| `app-web/src/app/core/services/storage.service.ts` | StorageService — upload, delete, getPublicUrl for Supabase Storage |
| `app-web/src/app/shared/components/image-upload/image-upload.component.ts` | Component logic for file selection, preview, validation, clipboard paste |
| `app-web/src/app/shared/components/image-upload/image-upload.component.html` | Template with drag-and-drop zone, paste hint, preview, remove button |
| `app-web/src/app/shared/components/image-upload/image-upload.component.scss` | Styles matching app design system |
| `supabase/migrations/20260513_add_receipt_url_fields.sql` | Migration adding `receipt_url` and `payment_receipt_url` columns |
| `supabase/migrations/20260513_create_receipts_bucket.sql` | Migration creating Storage bucket and RLS policies |

### Modified Files
| File | Change |
|------|--------|
| `app-web/src/app/core/models/appointment.model.ts` | Add `receipt_url` and `payment_receipt_url` fields to `Appointment` interface |
| `app-web/src/app/core/services/appointment.service.ts` | Update `updateStatus()` to accept optional `receiptUrl`; update `markAsPaid()` to accept optional `payment_receipt_url` |
| `app-web/src/app/features/backoffice/manager/appointments/appointments.component.ts` | Add image upload state, integrate StorageService, handle upload in `confirmStatusChange()` and `confirmPayment()` |
| `app-web/src/app/features/backoffice/manager/appointments/appointments.component.html` | Add `<app-image-upload>` to completion drawer and payment drawer sections |
| `app-web/src/app/features/backoffice/manager/appointments/appointments.component.scss` | Styles for image upload integration in drawers |

## Database Schema Changes

### Migration: Add receipt URL fields
```sql
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS receipt_url TEXT,
  ADD COLUMN IF NOT EXISTS payment_receipt_url TEXT;

COMMENT ON COLUMN appointments.receipt_url IS 'URL del comprobante adjuntado al completar la cita';
COMMENT ON COLUMN appointments.payment_receipt_url IS 'URL del comprobante de pago al empleado';
```

### Migration: Create receipts bucket
```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Managers can upload to their company folder
CREATE POLICY "Managers can upload receipts to their company"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'receipts'
  AND (storage.foldername(name))[1] = (SELECT company_id FROM profiles WHERE id = auth.uid())
);

-- Policy: Authenticated users can view receipts from their company
CREATE POLICY "Users can view receipts from their company"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'receipts'
  AND (storage.foldername(name))[1] = (SELECT company_id FROM profiles WHERE id = auth.uid())
);

-- Policy: Managers can delete receipts from their company
CREATE POLICY "Managers can delete receipts from their company"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'receipts'
  AND (storage.foldername(name))[1] = (SELECT company_id FROM profiles WHERE id = auth.uid())
);
```

## Component Design: ImageUploadComponent

### Inputs
- `currentImageUrl: Input<string | null>` — existing image URL to display (for viewing existing receipts)
- `uploading: Input<boolean>` — whether an upload is in progress (shows spinner)
- `error: Input<string | null>` — error message to display

### Outputs
- `imageSelected: Output<File>` — emitted when a valid image file is selected (via click, drag-and-drop, or paste)
- `imageRemoved: Output<void>` — emitted when the user removes the selected/existing image

### Behavior
- Accepts PNG/JPG files via three methods: file picker click, drag-and-drop, and clipboard paste (Ctrl+V / Cmd+V)
- Validates file type and size (max 2MB) client-side for all input methods
- Shows thumbnail preview of selected image
- Shows existing image if `currentImageUrl` is provided
- Shows "Remove" button to clear selection
- Disabled state when `uploading` is true (no click, no drop, no paste)
- Error display when `error` input is set
- Visual feedback on successful paste (green border flash)
- Clipboard images display as "Imagen pegada" since they have no file name
- Non-image clipboard data is silently ignored

### Template Structure
```
<div class="image-upload">
  @if (previewUrl || currentImageUrl()) {
    <div class="image-preview">
      <img [src]="previewUrl || currentImageUrl()" />
      <button (click)="removeImage()">✕</button>
      <span class="file-info">{{ fileName }} · {{ fileSize }}</span>
    </div>
  } @else {
    <div class="upload-zone" tabindex="0"
         (click)="fileInput.click()"
         (dragover)="onDragOver($event)"
         (drop)="onDrop($event)"
         (paste)="onPaste($event)">
      <i class="pi pi-cloud-upload"></i>
      <p>Arrastra, pega o haz clic para seleccionar una imagen</p>
      <span class="hint">PNG o JPG, máximo 2MB · También puedes pegar desde el portapapeles</span>
    </div>
  }
  @if (uploading()) { <p-progressBar /> }
  @if (error()) { <p class="error">{{ error() }}</p> }
  <input type="file" hidden #fileInput accept=".png,.jpg,.jpeg" (change)="onFileSelected($event)" />
</div>
```

### Clipboard Paste Implementation
```typescript
@HostListener('paste', ['$event'])
onPaste(event: ClipboardEvent): void {
  // 1. Prevent default paste behavior
  event.preventDefault();

  // 2. If uploading, ignore paste
  if (this.uploading()) return;

  // 3. Find image item in clipboard
  const items = event.clipboardData?.items;
  if (!items) return;

  for (let i = 0; i < items.length; i++) {
    if (items[i].type.startsWith('image/')) {
      const file = items[i].getAsFile();
      if (file) {
        // 4. Validate (same as file picker/drag-and-drop)
        try {
          this.validateFile(file);
          this.selectedFile.set(file);
          this.previewUrl.set(URL.createObjectURL(file));
          this.fileName.set('Imagen pegada');
          this.fileSize.set(this.formatFileSize(file.size));
          this.imageSelected.emit(file);
          // 5. Visual feedback
          this.showPasteFeedback.set(true);
          setTimeout(() => this.showPasteFeedback.set(false), 1000);
        } catch (e) {
          this.error.set((e as Error).message);
        }
      }
      return; // Only process first image
    }
  }
  // No image found in clipboard — silently ignore
}
```

## Service Design: StorageService

```typescript
@Injectable({ providedIn: 'root' })
export class StorageService {
  private supabase: SupabaseClient = supabase;

  async uploadReceipt(
    file: File,
    companyId: string,
    appointmentId: string,
    type: 'completion' | 'payment'
  ): Promise<string> {
    // 1. Validate file type (PNG/JPG only)
    // 2. Validate file size (max 2MB)
    // 3. Build path: receipts/{companyId}/{appointmentId}_{type}.{ext}
    // 4. Upload to Supabase Storage
    // 5. Return public URL
  }

  async deleteReceipt(path: string): Promise<void> {
    // Delete from Supabase Storage
  }

  getReceiptUrl(companyId: string, appointmentId: string, type: 'completion' | 'payment'): string {
    // Build and return the expected public URL
  }

  private validateFile(file: File): void {
    // Throw descriptive errors for invalid type or size
  }

  private getFileExtension(file: File): string {
    // Extract extension from file type or name
  }
}
```

## Styling Approach

The `ImageUploadComponent` follows the app's design system:
- Upload zone: dashed border (`--color-border`), cream background (`--color-cream`), rounded corners (`--radius-lg`)
- Hover state: sage border (`--color-sage`), slight background change
- Paste feedback: brief green border flash (`--color-success`) on successful paste
- Preview: white card with shadow (`--shadow-sm`), image thumbnail 80x80px
- Error text: coral color (`--color-coral`)
- File info: muted text (`--color-text-muted`)
- Paste hint text: smaller font, muted color, below main text
- All PrimeNG overrides in `styles.scss` (for drawer-rendered elements)
- Component-specific styles in `image-upload.component.scss`