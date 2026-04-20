# Tasks: Manager como Empleado

## Phase 1: Database

- [x] **1.1** Agregar columna `can_be_employee BOOLEAN DEFAULT false` a tabla `profiles` en `supabase/01-tables.sql`
- [x] **1.2** Agregar constraint CHECK `can_be_employee_only_for_managers` en `supabase/01-tables.sql`
- [x] **1.3** Crear helper function `get_current_user_can_be_employee()` en `supabase/02-rls-policies.sql`

## Phase 2: Backend

- [x] **2.1** Actualizar tipo `User` en `app-web/src/app/core/models/user.model.ts` — agregar `can_be_employee: boolean`
- [x] **2.2** Verificar que `AuthService.getCurrentUser()` incluya `can_be_employee` en `app-web/src/app/core/services/auth.service.ts`
- [x] **2.3** Actualizar `UserService.getEmployeesByCompany()` en `app-web/src/app/core/services/user.service.ts` para incluir managers con `can_be_employee=true`
- [x] **2.4** Agregar método `updateCanBeEmployee(userId, value)` en `UserService` en `app-web/src/app/core/services/user.service.ts`

## Phase 3: Guards

- [x] **3.1** Crear `canBeEmployeeGuard` en `app-web/src/app/core/guards/role.guard.ts` — verifica `can_be_employee=true` además del rol

## Phase 4: Routes

- [x] **4.1** Agregar ruta `/bo/mi-calendario` en `app-web/src/app/features/backoffice/manager/manager.routes.ts` — apunta a `EmployeeCalendarComponent` con `canBeEmployeeGuard`
- [x] **4.2** Agregar ruta `/bo/mi-historial` en `app-web/src/app/features/backoffice/manager/manager.routes.ts` — apunta a `EmployeeHistoryComponent` con `canBeEmployeeGuard`

## Phase 5: Manager Layout

- [x] **5.1** Actualizar `ManagerLayout` en `app-web/src/app/features/backoffice/backoffice.component.ts` — agregar items "Mi Calendario" y "Mi Historial" condicionales a `can_be_employee`

## Phase 6: Superadmin

- [x] **6.1** Ubicar formulario de edición de usuario en `app-web/src/app/features/backoffice/superadmin/central-management/`
- [x] **6.2** Agregar checkbox "Puede actuar como empleado" — visible solo cuando `role === 'manager'`
- [x] **6.3** Conectar checkbox con `UserService.updateCanBeEmployee()` al guardar

## Phase 7: Employee List in Manager View

- [x] **7.1** Verificar que `EmployeesComponent` en `app-web/src/app/features/backoffice/manager/employees/` ya usa `UserService.getEmployeesByCompany()`
- [x] **7.2** Confirmar que managers con `can_be_employee=true` aparecen en el listado
- [x] **7.3** Verificar que managers pueden editar sus servicios asignados

## Phase 8: Public Company List

- [x] **8.1** Ubicar componente de listado público en `app-web/src/app/features/public/company-list/`
- [x] **8.2** Actualizar consulta para incluir managers con `can_be_employee=true`
- [x] **8.3** Verificar que managers aparecen en la página de reservas públicas con su link `/c/:company_slug/e/:employee_id`

## Phase 9: Verification

- [x] **9.1** Ejecutar `npm run build` en `app-web/` — debe compilar sin errores
- [x] **9.2** Ejecutar tests con `npm run test` — todos pasan (456/456)
- [ ] **9.3** Verificar flujo manual:
  - [ ] Superadmin crea/editar manager, ve checkbox, guarda `can_be_employee=true`
  - [ ] Manager con flag entra, ve "Mi Calendario" y "Mi Historial" en menú
  - [ ] Manager accede a `/bo/mi-calendario` — ve SOLO sus citas
  - [ ] Manager accede a `/bo/mi-historial` — ve su historial
  - [ ] Página pública `/c/:slug` muestra al manager como opción de reserva
  - [ ] Cliente reserva con el manager — cita aparece en calendario del manager

## Nota: Migración de Base de Datos

La migración no pudo aplicarse automáticamente desde opencode (modo read-only). Necesitarás ejecutar manualmente:

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS can_be_employee BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD CONSTRAINT can_be_employee_only_for_managers
  CHECK (can_be_employee = false OR role = 'manager');
CREATE OR REPLACE FUNCTION get_current_user_can_be_employee()
RETURNS BOOLEAN AS $$
    SELECT can_be_employee FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;
```
