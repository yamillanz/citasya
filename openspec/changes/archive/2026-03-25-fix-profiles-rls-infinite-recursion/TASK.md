# TASK: Fix RLS infinite recursion in profiles table

## Tasks

- [x] Crear SQL de migración para corregir las políticas RLS
- [ ] Aplicar la migración a la base de datos Supabase (requiere acción manual)
- [ ] Verificar que GET /profiles retorna 200
- [ ] Probar login funcional

## SQL de Migración

```sql
-- Drop problematic policies
DROP POLICY IF EXISTS "profiles_select_company" ON profiles;
DROP POLICY IF EXISTS "profiles_update_company" ON profiles;
DROP POLICY IF EXISTS "profiles_select_superadmin" ON profiles;
DROP POLICY IF EXISTS "daily_closes_select" ON daily_closes;
DROP POLICY IF EXISTS "daily_closes_insert" ON daily_closes;

-- Recreate with fixed recursive queries using SECURITY DEFINER functions
CREATE POLICY "profiles_select_company" ON profiles
    FOR SELECT USING (company_id = get_current_user_company_id());

CREATE POLICY "profiles_update_company" ON profiles
    FOR UPDATE USING (
        company_id = get_current_user_company_id()
        AND role = 'employee'
    );

CREATE POLICY "profiles_select_superadmin" ON profiles
    FOR SELECT USING (get_current_user_role() = 'superadmin');

CREATE POLICY "daily_closes_select" ON daily_closes
    FOR SELECT USING (
        company_id = get_current_user_company_id()
        AND get_current_user_role() = 'manager'
    );

CREATE POLICY "daily_closes_insert" ON daily_closes
    FOR INSERT WITH CHECK (
        company_id = get_current_user_company_id()
        AND get_current_user_role() = 'manager'
    );
```
