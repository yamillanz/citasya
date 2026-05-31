# Proposal: Agregar estado "No disponible" a empleados

## Intent
Permitir que un manager marque a un empleado como "No disponible" (`not_available`).
Cuando un empleado está marcado como no disponible:
- No aparece en el listado público de empleados de la empresa (`/c/:company_slug`)
- Se desactiva el botón "Tu link" en la vista del empleado
- Se muestra el estado "No disponible" en el panel del manager

## Scope

### In
- Agregar columna `not_available` a tabla `profiles` en Supabase
- Actualizar modelo `User` en Angular
- Actualizar listado público de empleados para filtrar `not_available = true`
- Deshabilitar botón "Tu link" en vista de empleado cuando `not_available = true`
- Agregar control para togglear `not_available` en el panel del manager
- Actualizar política RLS de Supabase para excluir empleados no disponibles del acceso público
- Actualizar Edge Function `create-user` si es necesario
- Tests para el nuevo comportamiento

### Out
- No modificar el flujo de creación de citas existente
- No cambiar la lógica de `is_active` (activo/inactivo)
- No modificar el calendario de disponibilidad horaria del empleado

## Approach
1. **Backend primero**: Migración de base de datos + política RLS
2. **Modelo y servicios**: Actualizar `User` model y `UserService`
3. **UI Manager**: Agregar toggle/control de `not_available` en panel de empleados
4. **UI Pública**: Filtrar empleados no disponibles del listado
5. **UI Empleado**: Deshabilitar "Tu link" cuando no disponible
6. **Tests**: Verificar comportamiento en cada capa
