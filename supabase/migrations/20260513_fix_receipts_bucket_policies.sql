-- ============================================================================
-- Migration: Fix receipts bucket RLS policies
-- Date: 2026-05-13
-- Purpose: Drop and recreate RLS policies with correct path structure.
--          The storage path is now: {company_id}/{appointment_id}_{type}.{ext}
--          (no redundant 'receipts/' prefix).
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Managers can upload receipts to their company" ON storage.objects;
DROP POLICY IF EXISTS "Users can view receipts from their company" ON storage.objects;
DROP POLICY IF EXISTS "Managers can delete receipts from their company" ON storage.objects;

-- Policy: Managers can upload receipts to their company folder
CREATE POLICY "Managers can upload receipts to their company"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'receipts'
  AND (storage.foldername(name))[1] = (
    SELECT company_id::text FROM profiles WHERE id = auth.uid()
  )
);

-- Policy: Authenticated users can view receipts from their company
CREATE POLICY "Users can view receipts from their company"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'receipts'
  AND (storage.foldername(name))[1] = (
    SELECT company_id::text FROM profiles WHERE id = auth.uid()
  )
);

-- Policy: Managers can delete receipts from their company
CREATE POLICY "Managers can delete receipts from their company"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'receipts'
  AND (storage.foldername(name))[1] = (
    SELECT company_id::text FROM profiles WHERE id = auth.uid()
  )
);
