# Design: Agregar estado "No disponible" a empleados

## Architecture Decisions

### AD-001: Campo booleano simple
**Decision**: Usar un campo `BOOLEAN` simple en lugar de un enum de estados.
**Rationale**: El requerimiento es binario (disponible / no disponible). No se anticipan estados intermedios. Si en el futuro se necesitan más estados, se puede migrar a un enum.

### AD-002: Separación de is_active y not_available
**Decision**: Mantener `is_active` y `not_available` como campos independientes.
**Rationale**: 
- `is_active` controla si el usuario puede iniciar sesión y acceder al sistema
- `not_available` controla solo la visibilidad pública para reservas
- Un empleado puede estar activo (trabajando) pero temporalmente no disponible para nuevas citas

### AD-003: Filtrado en frontend + RLS
**Decision**: Filtrar en ambos niveles: RLS de Supabase y frontend.
**Rationale**: La política RLS garantiza seguridad a nivel de base de datos. El filtrado en frontend mejora la UX y reduce llamadas innecesarias.

## Data Flow

```
Manager Panel
    |
    v
Toggle not_available
    |
    v
UserService.update(id, { not_available: true })
    |
    v
Supabase profiles table
    |
    v
RLS Policy (excluye not_available = true del público)
    |
    +---> Public API (company-list) → Filtra not_available
    +---> Employee View → Deshabilita "Tu link"
```

## File Changes

### New Files
| File | Purpose |
|------|---------|
| `supabase/migrations/20260529_add_not_available_to_profiles.sql` | Migración de base de datos |
| `supabase/migrations/20260529_update_public_employees_policy.sql` | Actualización de política RLS |

### Modified Files
| File | Action | Purpose |
|------|--------|---------|
| `app-web/src/app/core/models/user.model.ts` | modify | Agregar `not_available?: boolean` a `User` y `CreateUserDto` |
| `app-web/src/app/core/services/user.service.ts` | modify | Agregar método `toggleNotAvailable(id, value)` |
| `app-web/src/app/features/backoffice/manager/employees/employees.component.ts` | modify | Agregar lógica de toggle y computed signals |
| `app-web/src/app/features/backoffice/manager/employees/employees.component.html` | modify | Agregar toggle y badge de no disponible |
| `app-web/src/app/features/backoffice/manager/employees/employee-form/employee-form.component.ts` | modify | Agregar campo `not_available` al formulario |
| `app-web/src/app/features/backoffice/manager/employees/employee-form/employee-form.component.html` | modify | Agregar checkbox para `not_available` |
| `app-web/src/app/features/public/company-list/company-list.component.ts` | modify | Filtrar empleados con `not_available = true` |
| `app-web/src/app/features/backoffice/employee/calendar/employee-calendar.component.html` | modify | Deshabilitar "Tu link" cuando `not_available = true` |
| `app-web/src/app/features/backoffice/employee/calendar/employee-calendar.component.ts` | modify | Computed signal para estado de disponibilidad |
| `backend/create-user/index.ts` | modify | Aceptar `not_available` en creación de usuario |

## Supabase Changes

### Migration 1: Add column
```sql
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS not_available BOOLEAN DEFAULT false;
```

### Migration 2: Update RLS Policy
```sql
DROP POLICY IF EXISTS profiles_select_public_employees ON profiles;

CREATE POLICY profiles_select_public_employees ON profiles
  FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true 
    AND role = 'employee'
    AND not_available = false
  );
```

## UI Design

### Manager - Listado de empleados
- Agregar toggle switch (p-toggleSwitch) en cada card de empleado
- Label: "No disponible para citas"
- Badge/tag rojo cuando `not_available = true`
- Filtro adicional: "No disponibles" en los tabs de filtro

### Manager - Formulario de empleado
- Checkbox al final del formulario: "Marcar como no disponible para citas"
- Descripción helper: "El empleado no aparecerá en el listado público de reservas"

### Empleado - Vista de calendario
- Botón "Tu link": `[disabled]="user.not_available"`
- Tooltip cuando deshabilitado: "No disponible para reservas"
- Badge opcional en el header indicando estado

### Público - Listado de empleados
- Sin cambios visuales (simplemente no aparecen los no disponibles)
