# Tasks: Agregar estado "No disponible" a empleados

## Phase 1: Backend (Base de datos y RLS)
- [x] 1.1 Crear migración `20260529_add_not_available_to_profiles.sql`
  - Agregar columna `not_available BOOLEAN DEFAULT false` a tabla `profiles`
- [x] 1.2 Crear migración `20260529_update_public_employees_policy.sql`
  - Actualizar política RLS `profiles_select_public_employees` para excluir `not_available = true`
- [x] 1.3 Aplicar migraciones en base de datos de desarrollo
- [x] 1.4 Verificar que la columna existe y la política funciona correctamente

## Phase 2: Modelo y Servicios
- [x] 2.1 Actualizar `app-web/src/app/core/models/user.model.ts`
  - Agregar `not_available?: boolean` a interfaz `User`
  - Agregar `not_available?: boolean` a `CreateUserDto`
- [x] 2.2 Actualizar `app-web/src/app/core/services/user.service.ts`
  - Agregar método `toggleNotAvailable(id: string, value: boolean): Promise<User>`
  - Verificar que `update()` puede manejar `not_available`
- [x] 2.3 Actualizar `backend/create-user/index.ts`
  - Aceptar campo `not_available` en el body
  - Incluir `not_available` en el insert a `profiles`

## Phase 3: UI - Panel de Manager
- [x] 3.1 Actualizar `employees.component.ts`
  - Agregar computed signals para conteo de no disponibles
  - Agregar método `toggleEmployeeNotAvailable(employee: User)`
  - Actualizar filtros para incluir estado "No disponibles"
- [x] 3.2 Actualizar `employees.component.html`
  - Agregar toggle switch para `not_available` en cada card
  - Agregar badge "No disponible" cuando corresponda
  - Agregar tab/filtro "No disponibles"
- [x] 3.3 Actualizar `employee-form.component.ts`
  - Agregar campo `not_available` al FormBuilder
- [x] 3.4 Actualizar `employee-form.component.html`
  - Agregar checkbox `p-checkbox` para `not_available`
  - Incluir texto explicativo

## Phase 4: UI - Vista de Empleado
- [x] 4.1 Actualizar `employee-calendar.component.ts`
  - Agregar computed signal `isNotAvailable()` basado en el usuario actual
- [x] 4.2 Actualizar `employee-calendar.component.html`
  - Deshabilitar botón "Tu link" cuando `not_available = true`
  - Cambiar tooltip cuando está deshabilitado
  - Opcional: agregar badge de estado en header

## Phase 5: UI - Listado Público
- [x] 5.1 Actualizar `company-list.component.ts`
  - Filtrar empleados con `not_available = true` antes de mostrarlos
- [x] 5.2 Verificar que el filtrado funciona correctamente

## Phase 6: Tests
- [x] 6.1 Actualizar tests de `UserService` para incluir `not_available`
- [x] 6.2 Agregar tests para `toggleNotAvailable`
- [x] 6.3 Actualizar tests de `employees.component` para verificar toggle de no disponible
- [x] 6.4 Agregar tests para filtrado en `company-list.component`
- [x] 6.5 Verificar que todos los tests pasan (`npm test`)

## Phase 7: Verificación y Documentación
- [x] 7.1 Verificar flujo completo:
  - Manager marca empleado como no disponible
  - Empleado no aparece en listado público
  - Botón "Tu link" deshabilitado en vista de empleado
- [x] 7.2 Actualizar documentación si es necesario
- [x] 7.3 Commit y push de todos los cambios
