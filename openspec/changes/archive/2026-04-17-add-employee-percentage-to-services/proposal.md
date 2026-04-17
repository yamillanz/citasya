# Proposal: Agregar porcentaje de comisión para empleados en servicios

## Why

El formulario de servicios en el backoffice no incluye el campo `commission_percentage` que ya existe en la base de datos. Los managers no pueden definir qué porcentaje del precio del servicio se lleva cada empleado, lo cual es necesario para el cálculo de comisiones.

## What Changes

- Agregar campo `commission_percentage` al formulario de creación/edición de servicios
- Valor por defecto: 50%
- Rango válido: 0-100%
- Incluir en el preview del servicio
- Actualizar tests unitarios

## Capabilities

### New Capabilities

- `employee-percentage-field`: Campo para ingresar el porcentaje de comisión del empleado (0-100%)

### Modified Capabilities

- Ninguno (es una adición simple al formulario existente)

## Impact

- **Código afectado**:
  - `app-web/src/app/features/backoffice/manager/services/service-form/`
  - `app-web/src/app/core/models/service.model.ts` (ya tiene el campo)
  - Tests en `service-form.component.spec.ts`
- **Base de datos**: Campo ya existe (`commission_percentage` en tabla `services`)
- **UI**: Nuevo campo en el formulario de servicios