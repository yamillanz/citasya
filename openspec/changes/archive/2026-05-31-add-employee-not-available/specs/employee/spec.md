# Spec: Empleado - Estado "No disponible"

## ADDED Requirements

### REQ-001: Campo not_available en perfil
**SHALL** existir una columna `not_available` de tipo `BOOLEAN` en la tabla `profiles` con valor por defecto `false`.

- **Scenario**: Migración aplicada
  - **Given** la tabla `profiles` existe
  - **When** se ejecuta la migración `add_not_available_to_profiles`
  - **Then** la columna `not_available` existe con tipo `BOOLEAN DEFAULT false`

### REQ-002: Modelo User actualizado
**SHALL** la interfaz `User` incluir la propiedad opcional `not_available?: boolean`.

- **Scenario**: Lectura de empleado
  - **Given** un empleado existe en la base de datos
  - **When** se obtiene el empleado vía `UserService`
  - **Then** la propiedad `not_available` está presente en el objeto

### REQ-003: Filtrado en listado público
**SHALL** el listado público de empleados (`/c/:company_slug`) excluir empleados con `not_available = true`.

- **Scenario**: Cliente ve listado de empleados
  - **Given** una empresa tiene 3 empleados: 2 disponibles y 1 no disponible
  - **When** un cliente visita la página pública de la empresa
  - **Then** solo ve 2 empleados en el listado
  - **And** el empleado no disponible no aparece

### REQ-004: Política RLS actualizada
**SHALL** la política `profiles_select_public_employees` excluir filas donde `not_available = true`.

- **Scenario**: Acceso público a empleados
  - **Given** un empleado con `not_available = true`
  - **When** un usuario anónimo consulta la tabla `profiles`
  - **Then** no puede ver ese empleado

### REQ-005: Botón "Tu link" deshabilitado
**SHALL** el botón "Tu link" en la vista del empleado estar deshabilitado cuando `not_available = true`.

- **Scenario**: Empleado no disponible ve su vista
  - **Given** un empleado autenticado con `not_available = true`
  - **When** navega a su vista de calendario
  - **Then** el botón "Tu link" está deshabilitado
  - **And** muestra un tooltip indicando "No disponible para reservas"

### REQ-006: Control en panel de manager
**SHALL** el panel de manager permitir marcar/desmarcar `not_available` para cada empleado.

- **Scenario**: Manager marca empleado como no disponible
  - **Given** el manager ve el listado de empleados
  - **When** activa el toggle de "No disponible" para un empleado
  - **Then** el empleado se actualiza con `not_available = true`
  - **And** el empleado desaparece del listado público

### REQ-007: Indicador visual en panel de manager
**SHALL** el listado de empleados del manager mostrar un indicador visual (badge/tag) cuando un empleado está marcado como "No disponible".

- **Scenario**: Manager ve listado de empleados
  - **Given** un empleado tiene `not_available = true`
  - **When** el manager ve el listado
  - **Then** aparece un badge "No disponible" junto al nombre del empleado
