-- Migration: Fix RLS infinite recursion in profiles table
-- Date: 2026-03-25
-- Issue: Error 42P17 - infinite recursion in policy for relation profiles

-- ============================================================================
-- 1. Drop problematic policies that cause infinite recursion
-- ============================================================================

DROP POLICY IF EXISTS "profiles_select_company" ON profiles;
DROP POLICY IF EXISTS "profiles_update_company" ON profiles;
DROP POLICY IF EXISTS "profiles_select_superadmin" ON profiles;
DROP POLICY IF EXISTS "daily_closes_select" ON daily_closes;
DROP POLICY IF EXISTS "daily_closes_insert" ON daily_closes;

-- ============================================================================
-- 2. Recreate policies using SECURITY DEFINER functions to avoid recursion
-- ============================================================================

-- Users can see profiles in their company
CREATE POLICY "profiles_select_company" ON profiles
    FOR SELECT USING (company_id = get_current_user_company_id());

-- Managers can update employees in their company
CREATE POLICY "profiles_update_company" ON profiles
    FOR UPDATE USING (
        company_id = get_current_user_company_id()
        AND role = 'employee'
    );

-- Superadmin can see all profiles
CREATE POLICY "profiles_select_superadmin" ON profiles
    FOR SELECT USING (get_current_user_role() = 'superadmin');

-- Managers can see daily closes of their company
CREATE POLICY "daily_closes_select" ON daily_closes
    FOR SELECT USING (
        company_id = get_current_user_company_id()
        AND get_current_user_role() = 'manager'
    );

-- Managers can create daily closes for their company
CREATE POLICY "daily_closes_insert" ON daily_closes
    FOR INSERT WITH CHECK (
        company_id = get_current_user_company_id()
        AND get_current_user_role() = 'manager'
    );
