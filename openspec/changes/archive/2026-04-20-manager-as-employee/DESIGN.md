# Design: Manager como Empleado

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  BASE DE DATOS                                              │
│  ─────────────────                                          │
│  profiles: ADD can_be_employee BOOLEAN DEFAULT false       │
│                                                             │
│  RLS: policies actualizadas para filtrar por employee_id  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND (Services)                                         │
│  ─────────────────────                                      │
│  UserService:                                               │
│    - getEmployeesByCompany() → incluir managers con        │
│      can_be_employee=true                                   │
│    - updateCanBeEmployee(id, value) → solo superadmin       │
│                                                             │
│  AppointmentService:                                        │
│    - Sin cambios (ya filtra por employee_id)               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND                                                   │
│  ─────────                                                   │
│  1. ManagerLayout: menú con "Mi Calendario", "Mi Historial" │
│     (condicional a can_be_employee)                         │
│                                                             │
│  2. Nuevas rutas:                                           │
│     /bo/mi-calendario → EmployeeCalendarComponent           │
│     /bo/mi-historial   → EmployeeHistoryComponent            │
│     (ambas con acceso condicional a can_be_employee)        │
│                                                             │
│  3. Superadmin Form: checkbox "Puede actuar como empleado" │
│     (visible solo si role=manager)                          │
│                                                             │
│  4. /bo/employees: incluir managers con can_be_employee    │
│                                                             │
│  5. /c/:slug: incluir managers con can_be_employee         │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Database Changes

### 1.1 Add Column to `profiles`

**File**: `supabase/01-tables.sql`

```sql
-- Add can_be_employee flag
ALTER TABLE profiles ADD COLUMN can_be_employee BOOLEAN DEFAULT false;

-- Prevent non-managers from having can_be_employee=true
ALTER TABLE profiles ADD CONSTRAINT can_be_employee_only_for_managers
  CHECK (can_be_employee = false OR role = 'manager');
```

### 1.2 RLS Helper Function

**File**: `supabase/02-rls-policies.sql`

```sql
-- Helper to get current user's can_be_employee flag
CREATE OR REPLACE FUNCTION get_current_user_can_be_employee()
RETURNS BOOLEAN AS $$
  SELECT can_be_employee FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;
```

---

## Phase 2: Backend Services

### 2.1 UserService Updates

**File**: `app-web/src/app/core/services/user.service.ts`

**Changes**:
1. `getEmployeesByCompany(companyId)` — incluir managers con `can_be_employee=true` en la lista de empleados
2. Nuevo método `updateCanBeEmployee(userId: string, value: boolean)` — para superadmin

```typescript
// Dentro de getEmployeesByCompany o método similar
// Agregar filter: .eq('can_be_employee', true) OR .eq('role', 'employee')
```

### 2.2 User Model Update

**File**: `app-web/src/app/core/models/user.model.ts`

```typescript
interface User {
  // ... existing fields
  can_be_employee: boolean;  // NEW
}
```

### 2.3 AuthService

**File**: `app-web/src/app/core/services/auth.service.ts`

Verificar que `getCurrentUser()` incluya `can_be_employee` en el objeto User retornado.

---

## Phase 3: Frontend - Superadmin

### 3.1 CentralManagement Component

**File**: `app-web/src/app/features/backoffice/superadmin/central-management/`

**Changes**:
- Agregar checkbox "Puede actuar como empleado" en el formulario de usuario
- Mostrar solo cuando `role = 'manager'`
- Llamar `userService.updateCanBeEmployee()` al guardar

**UI Condition**:
```typescript
@if (user.role === 'manager') {
  <p-checkbox
    [(ngModel)]="user.can_be_employee"
    [binary]="true"
    inputId="canBeEmployee"
  />
  <label for="canBeEmployee">Puede actuar como empleado</label>
}
```

---

## Phase 4: Frontend - Manager Layout

### 4.1 ManagerLayout Menu

**File**: `app-web/src/app/features/backoffice/backoffice.component.ts`

**Changes**:
- Condicionar items "Mi Calendario" y "Mi Historial" a `user.can_be_employee`
- Acceder al usuario actual via `AuthService.getCurrentUser()`

```typescript
// En el getter del menú
get menuItems() {
  const baseItems = [/* dashboard, empleados, servicios, etc */];

  if (this.currentUser()?.can_be_employee) {
    return [
      ...baseItems,
      { label: 'Mi Calendario', icon: 'pi pi-calendar', routerLink: '/bo/mi-calendario' },
      { label: 'Mi Historial', icon: 'pi pi-history', routerLink: '/bo/mi-historial' }
    ];
  }

  return baseItems;
}
```

---

## Phase 5: Frontend - Routes

### 5.1 New Routes

**File**: `app-web/src/app/features/backoffice/manager/manager.routes.ts`

**Changes**:
- Agregar rutas `/bo/mi-calendario` y `/bo/mi-historial`
- Usar guard `canBeEmployeeGuard` para protegerlas

```typescript
export const MANAGER_ROUTES: Routes = [
  // ... existing routes
  {
    path: 'mi-calendario',
    loadComponent: () => import('../employee/calendar/employee-calendar.component')
      .then(m => m.EmployeeCalendarComponent),
    canActivate: [canBeEmployeeGuard]
  },
  {
    path: 'mi-historial',
    loadComponent: () => import('../employee/history/employee-history.component')
      .then(m => m.EmployeeHistoryComponent),
    canActivate: [canBeEmployeeGuard]
  }
];
```

### 5.2 New Guard

**File**: `app-web/src/app/core/guards/role.guard.ts`

```typescript
export const canBeEmployeeGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = await authService.getCurrentUser();
  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  if (user.can_be_employee) {
    return true;
  }

  router.navigate(['/bo/dashboard']);
  return false;
};
```

---

## Phase 6: Frontend - Listados

### 6.1 Employees Component (Manager)

**File**: `app-web/src/app/features/backoffice/manager/employees/`

**Changes**:
- Modificar `getEmployeesByCompany()` para incluir managers con `can_be_employee=true`
- En el template, managers mostrados con indicador visual (badge "Manager + Empleado")
- Pueden editar sus servicios y copiar link

### 6.2 Public Company List

**File**: `app-web/src/app/features/public/company-list/`

**Changes**:
- La consulta de empleados incluye managers con `can_be_employee=true`
- En el template, managers mostrados con nombre y datos de empleado regular

---

## Alternatives Evaluated and Discarded

| Alternative | Why Discarded |
|-------------|--------------|
| Reuse `/emp/*` routes with EmployeeLayout | Would show employee menu instead of manager menu |
| Junction table `user_companies` for many-to-many | Overkill: scope is single company per user |
| `employee_status` enum instead of boolean | YAGNI: more flexible but we only need binary for now |
| Toggle in superadmin listing | Checkbox in form is sufficient for this release |
| Manager can self-enable | Requirement explicitly says only superadmin can enable |

---

## File Inventory

| File | Action | Purpose |
|------|--------|---------|
| `supabase/01-tables.sql` | modified | Add `can_be_employee` column |
| `supabase/02-rls-policies.sql` | modified | Add helper function |
| `app-web/src/app/core/models/user.model.ts` | modified | Add `can_be_employee` to User interface |
| `app-web/src/app/core/services/user.service.ts` | modified | Include managers in employees, add update method |
| `app-web/src/app/core/services/auth.service.ts` | modified | Ensure `can_be_employee` is returned |
| `app-web/src/app/core/guards/role.guard.ts` | modified | Add `canBeEmployeeGuard` |
| `app-web/src/app/features/backoffice/backoffice.component.ts` | modified | Conditional menu items |
| `app-web/src/app/features/backoffice/manager/manager.routes.ts` | modified | Add `/bo/mi-*` routes |
| `app-web/src/app/features/backoffice/superadmin/central-management/` | modified | Add checkbox in form |
| `app-web/src/app/features/backoffice/manager/employees/` | modified | Include managers in list |
| `app-web/src/app/features/public/company-list/` | modified | Include managers in public list |

---

## Testing Strategy

### Unit Tests
- `canBeEmployeeGuard` redirects correctly based on flag
- Menu items correctly shown/hidden based on `can_be_employee`
- `UserService.updateCanBeEmployee()` calls API correctly

### Integration Tests
- Manager with `can_be_employee=true` can access `/bo/mi-calendario`
- Manager with `can_be_employee=false` cannot access `/bo/mi-calendario`
- Manager with `can_be_employee=true` appears in public booking page
- Superadmin can toggle `can_be_employee` and change takes effect immediately
