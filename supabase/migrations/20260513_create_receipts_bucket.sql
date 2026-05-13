-- ============================================================================
-- Migration: Create receipts storage bucket with RLS policies
-- Date: 2026-05-13
-- Purpose: Enable receipt image upload for appointment completion and payment
-- ============================================================================

-- Create storage bucket (non-public, requires authenticated access)
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Managers can upload receipts to their company folder
CREATE POLICY "Managers can upload receipts to their company"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'receipts'
  AND (storage.foldername(name))[1] = (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
);

-- Policy: Authenticated users can view receipts from their company
CREATE POLICY "Users can view receipts from their company"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'receipts'
  AND (storage.foldername(name))[1] = (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
);

-- Policy: Managers can delete receipts from their company
CREATE POLICY "Managers can delete receipts from their company"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'receipts'
  AND (storage.foldername(name))[1] = (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
);
