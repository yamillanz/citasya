# SPEC: Fix RLS infinite recursion in profiles table

## Problem Statement

Error al consultar la tabla `profiles`:

```
{"code":"42P17","message":"infinite recursion detected in policy for relation \"profiles\""}
```

## Root Cause

Las políticas RLS en `profiles` contienen subconsultas a la misma tabla `profiles`:

```sql
-- Línea 73-76: profiles_select_company
CREATE POLICY "profiles_select_company" ON profiles
    FOR SELECT USING (
        company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())  -- RECURSIÓN
    );

-- Línea 93-97: profiles_update_company
CREATE POLICY "profiles_update_company" ON profiles
    FOR UPDATE USING (
        company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())  -- RECURSIÓN
        AND role = 'employee'
    );
```

Cuando PostgreSQL evalúa estas políticas, necesita acceder a `profiles`, lo cual dispara las mismas políticas → recursión infinita.

## Solution

El archivo SQL ya define funciones `SECURITY DEFINER` que evitan la recursión (líneas 280-289):

```sql
CREATE OR REPLACE FUNCTION get_current_user_company_id()
RETURNS UUID AS $$
    SELECT company_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
    SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;
```

Con `SECURITY DEFINER`, la función se ejecuta con privilegios del creador (no se aplican RLS dentro).

## SQL Fix Required

Reemplazar todas las subconsultas a `profiles` en las políticas RLS por las funciones对应:

| Política | Original | Corregido |
|----------|----------|-----------|
| profiles_select_company | `company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())` | `company_id = get_current_user_company_id()` |
| profiles_update_company | `company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())` | `company_id = get_current_user_company_id()` |
| companies_insert | `auth.uid() IN (SELECT id FROM profiles WHERE role = 'superadmin')` | `auth.uid() IN (SELECT id FROM profiles WHERE role = 'superadmin')` (no recursion - no dependent on profiles rows being accessed) |
| companies_update | Similar | Similar |
| profiles_select_superadmin | `auth.uid() IN (SELECT id FROM profiles WHERE role = 'superadmin')` | `get_current_user_role() = 'superadmin'` |
| daily_closes_select | `(SELECT role FROM profiles WHERE id = auth.uid()) = 'manager'` | `get_current_user_role() = 'manager'` |
| daily_closes_insert | Similar | Similar |

## Verification

1. Aplicar el SQL fix a la base de datos Supabase
2. Probar GET `profiles?id=eq.xxx` - debe retornar 200
3. Probar login completo

## File Location

SQL file: `/supabase-holacitas/02-rls-policies.sql`
