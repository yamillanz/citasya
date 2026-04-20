# Specs: Manager como Empleado (Delta Specs)

## Overview

Agregar capability a un `manager` de actuar como `employee` dentro de la misma empresa, manteniendo su rol de manager y acceso completo al panel de administración.

---

## Added Requirements

### REQ-001: Flag `can_be_employee` en Perfil

**Description**: Agregar campo booleano a `profiles` para indicar si un manager puede actuar como empleado.

**Details**:
- Campo: `can_be_employee BOOLEAN DEFAULT false`
- Tabla: `profiles`
- Solo editable por `superadmin`
- Solo aplica para usuarios con `role = 'manager'`
- Un `superadmin` puede togglear este valor desde el formulario de edición de usuario

**Acceptance Criteria**:
- [ ] Campo existe en tabla `profiles`
- [ ] Un manager sin `can_be_employee` no ve opciones de empleado
- [ ] Un manager con `can_be_employee=true` ve opciones de empleado en menú
- [ ] Solo superadmin puede modificar el valor
- [ ] El valor persiste entre sesiones

---

### REQ-002: Menú del Manager con Funciones de Empleado

**Description**: Cuando un manager tiene `can_be_employee=true`, aparecen opciones adicionales en su menú para acceder a funcionalidades de empleado.

**Details**:
- Items agregados al menú del `ManagerLayout`:
  - "Mi Calendario" — acceso a `/bo/mi-calendario`
  - "Mi Historial" — acceso a `/bo/mi-historial`
- Estos items aparecen SOLO si `can_be_employee=true`
- El resto del menú (Dashboard, Empleados, Servicios, etc.) se mantiene igual
- El layout del manager no cambia

**Acceptance Criteria**:
- [ ] Menú del manager muestra opciones adicionales cuando `can_be_employee=true`
- [ ] Menú del manager NO muestra opciones adicionales cuando `can_be_employee=false`
- [ ] El layout del manager permanece sin cambios
- [ ] Navegación funciona correctamente

---

### REQ-003: Rutas de Empleado en Contexto de Manager

**Description**: Agregar rutas `/bo/mi-calendario` y `/bo/mi-historial` que reutilizan los componentes existentes de empleado pero mantienen el layout de manager.

**Details**:
- Ruta: `/bo/mi-calendario` → `EmployeeCalendarComponent` (reutilizado)
- Ruta: `/bo/mi-historial` → `EmployeeHistoryComponent` (reutilizado)
- Ambas rutas usan `ManagerLayout`
- Acceso limitado a usuarios con `can_be_employee=true`
- Las consultas de citas filtran por `employee_id = currentUser.id`

**Acceptance Criteria**:
- [ ] `/bo/mi-calendario` muestra el calendario del manager como empleado
- [ ] `/bo/mi-historial` muestra el historial del manager como empleado
- [ ] Las citas mostradas son solo las asignadas al manager
- [ ] El layout mostrado es el del manager (menú completo)
- [ ] Acceso denegado si `can_be_employee=false`

---

### REQ-004: Listado de Empleados Incluye Managers

**Description**: El listado de empleados en `/bo/employees` debe incluir a los managers con `can_be_employee=true` para que puedan gestionar sus servicios.

**Details**:
- En `/bo/employees`, la lista de empleados incluye managers con `can_be_employee=true`
- Un manager con `can_be_employee=true` puede:
  - Ver su perfil en el listado
  - Editar sus servicios asignados
  - Copiar su link de reservas públicas
- El resto de empleados funciona igual

**Acceptance Criteria**:
- [ ] Managers con `can_be_employee=true` aparecen en `/bo/employees`
- [ ] Pueden editar sus servicios asignados
- [ ] Pueden copiar su link de reservas (`/c/:company_slug/e/:employee_id`)
- [ ] No pueden ser eliminados desde ahí (son managers)

---

### REQ-005: Página Pública Incluye Managers

**Description**: La página de reservas pública `/c/:company_slug` debe incluir a los managers con `can_be_employee=true` como opciones de empleado disponibles.

**Details**:
- En `/c/:company_slug`, la lista de empleados disponibles para reserva incluye managers con `can_be_employee=true`
- Los clientes pueden seleccionar al manager para agendar una cita
- El manager aparece con los mismos datos que los otros empleados (nombre, foto, servicios)

**Acceptance Criteria**:
- [ ] Managers con `can_be_employee=true` aparecen en `/c/:company_slug`
- [ ] Son seleccionables para reserva de cita
- [ ] El flujo de reservación funciona igual que para empleados regulares
- [ ] Las citas del manager se guardan con `employee_id = manager.id`

---

### REQ-006: Superadmin puede Habilitar/Deshabilitar

**Description**: Un superadmin puede togglear el flag `can_be_employee` desde el formulario de gestión de usuarios.

**Details**:
- En `/sa/management`, al editar un usuario con rol `manager`, se muestra checkbox "Puede actuar como empleado"
- Checkbox visible solo si `role = 'manager'`
- Guardado via API/PGT
- Cambio es inmediato (no requiere logout/login)

**Acceptance Criteria**:
- [ ] Superadmin ve checkbox al editar manager
- [ ] Superadmin NO ve checkbox al editar employee o superadmin
- [ ] Guardar `can_be_employee=true` habilita opciones al manager
- [ ] Guardar `can_be_employee=false` deshabilita opciones
- [ ] Cambio es inmediato sin necesidad de re-login

---

## Data Model Changes

### Table: `profiles`

```sql
-- Add column
ALTER TABLE profiles ADD COLUMN can_be_employee BOOLEAN DEFAULT false;

-- Optional: prevent non-managers from having can_be_employee=true
ALTER TABLE profiles ADD CONSTRAINT can_be_employee_only_for_managers
  CHECK (can_be_employee = false OR role = 'manager');
```

### Type: `User` (frontend)

```typescript
interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  photo_url: string | null;
  role: 'superadmin' | 'manager' | 'employee';
  company_id: string | null;
  is_active: boolean;
  can_be_employee: boolean;  // NEW
  created_at: string;
  updated_at: string;
}
```

---

## Security Considerations

- `can_be_employee` solo puede ser modificado por superadmin
- Rutas `/bo/mi-*` requieren `can_be_employee=true` además del rol manager
- RLS policies deben filtrar correctamente por `employee_id` para que un manager solo vea sus propias citas
- Página pública `/c/:slug` solo debe mostrar managers con `can_be_employee=true` y `is_active=true`

---

## Out of Scope

- Multi-empresa (un manager solo puede ser empleado de su propia empresa)
- Auto-habilitación (el manager no puede togglear su propio flag)
- Cambio de rol employee → manager
- Modificación de reportes o cierre diario (funcionan igual)
