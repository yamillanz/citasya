# Proposal: Image Upload for Receipts/Vouchers

## Intent

Allow Managers to attach receipt/voucher images (comprobantes bancarios) when completing an appointment and when registering a payment to an employee. This provides visual evidence of financial transactions, improving traceability and accountability.

## Scope

### In
- Create a Supabase Storage bucket for receipt images
- Add `receipt_url` and `payment_receipt_url` columns to the `appointments` table
- Create a reusable `StorageService` for Supabase Storage operations (upload, delete, getPublicUrl)
- Create a reusable `ImageUploadComponent` (PrimeNG-based) for image selection, preview, and upload
- Integrate image upload into the "Completar cita" drawer (receipt_url)
- Integrate image upload into the "Registrar pago" drawer (payment_receipt_url)
- Display receipt thumbnails on appointment cards (when receipt exists)
- RLS policies on the storage bucket (managers can upload, authenticated users can view)
- Client-side image validation: PNG/JPG only, max 2MB
- Server-side: Supabase Storage policies enforce company-scoped access

### Out
- Viewing receipts in reports (separate future task)
- Employee viewing their own receipts (separate future task)
- Multiple image upload (only one image per receipt field)
- PDF or other document uploads
- Image compression/optimization on the client (future enhancement)
- Receipt management (edit/delete after upload) — only upload and display

## Approach

1. **Database**: Add two nullable text columns to `appointments`: `receipt_url` (for completion receipt) and `payment_receipt_url` (for payment receipt)
2. **Storage**: Create a Supabase Storage bucket `receipts` with folder structure `receipts/{company_id}/` and appropriate RLS policies
3. **Service**: Create `StorageService` in `core/services/` wrapping Supabase Storage SDK
4. **Component**: Create `ImageUploadComponent` in `shared/components/` — a reusable PrimeNG-based component with file input, preview, and upload progress
5. **Integration**: Add the image upload component to both the completion drawer and payment drawer in `AppointmentsComponent`
6. **Display**: Show a small thumbnail/icon on appointment cards when a receipt is attached

## Dependencies

- Supabase project must have Storage API enabled (default in all Supabase projects)
- The `receipts` bucket must be created before the feature can work
- Migration must be applied before frontend changes