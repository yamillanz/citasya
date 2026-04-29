## Why

El formulario de reserva pública (`booking-form`) muestra un error que dice "El teléfono debe tener al menos 12 dígitos", pero la función `formatPhone()` limita la entrada a un máximo de 10 dígitos (formato `XXX-XXX-XXXX`). Esto hace imposible para los usuarios completar el formulario si no proporcionan email, ya que nunca pueden alcanzar los 12 dígitos requeridos.

## What Changes

- Modificar la función `formatPhone()` en `booking-form.component.ts` para permitir hasta 12 dígitos en lugar de 10.
- Actualizar el formato de visualización para soportar números internacionales de hasta 12 dígitos (ej: `XX-XXX-XXX-XXXX`).
- Asegurar que el validador del formulario y el mensaje de error en el template sean consistentes con el nuevo límite.

## Capabilities

### New Capabilities
- (ninguno)

### Modified Capabilities
- (ninguno — es un bug fix de implementación, no cambia requisitos de specs existentes)

## Impact

- `app-web/src/app/features/public/booking-form/booking-form.component.ts`
- `app-web/src/app/features/public/booking-form/booking-form.component.html`
- Experiencia de usuario en el flujo de reserva pública
