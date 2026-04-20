# Proposal: Manager como Empleado

## Intent

Habilitar que un usuario con rol `manager` también pueda actuar como `employee` (prestar servicios, recibir citas). Orientado a empresas pequeñas (2-3 empleados) donde el dueño también presta servicios directamente.

## Problem Statement

En CitasYa, un usuario tiene un único rol: `superadmin`, `manager` o `employee`. Esto funciona bien para empresas medianas/grandes donde roles están claramente separados. Sin embargo, en empresas pequeñas (2-3 empleados), el dueño frecuentemente también presta servicios y necesita:

- Ver su propio calendario de citas
- Recibir reservas directas de clientes
- Gestionar sus servicios asignados
- Ver su historial de citas

Actualmente el manager no tiene acceso a estas funcionalidades de empleado, y crear un usuario separado para el mismo человек (para tener rol `employee`) genera confusión y problemas de gestión.

## Goals

- Permitir que un manager con `can_be_employee=true` acceda a funcionalidades de empleado desde el mismo panel de manager
- Un solo login, un solo menú (con opciones adicionales)
- Habilitado únicamente por superadmin (el manager no puede auto-habilitarse)
- Transparente en reportes y cierre diario

## Non-Goals

- No cambiar el flujo de login (siempre redirige al dashboard)
- No modificar la lógica de reportes o cierre diario
- No implementar multi-empresa (un manager solo puede ser empleado de SU empresa)
- No permitir que un employee sea manager

## Approach

Siguiente el flujo OpenSpec: proposal → specs → design → tasks

## References

- Investigación completa en: [link to exploration task result]
- Tabla `profiles` actual: 1-user : 1-company : 1-role
- `employeeGuard` ya permite `manager` y `superadmin` acceder a rutas de empleado

## Status

- [x] Proposal written
- [ ] Specs written
- [ ] Design written
- [ ] Tasks written
- [ ] Implementation complete
- [ ] Verified
