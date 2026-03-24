-- Migration: add_is_active_to_companies_and_plans.sql
-- Description: Add is_active column to companies and plans tables for soft-delete functionality

-- Add is_active column to companies table
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Add is_active column to plans table  
ALTER TABLE public.plans
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Set is_active = true for existing records
UPDATE public.companies SET is_active = true WHERE is_active IS NULL;
UPDATE public.plans SET is_active = true WHERE is_active IS NULL;
