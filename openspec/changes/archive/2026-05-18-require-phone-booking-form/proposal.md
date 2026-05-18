## Why

El formulario de contacto en el booking público (`/c/:slug/e/:id/book`) permite enviar la reserva con solo nombre y email, dejando el teléfono vacío. Sin embargo, la base de datos tiene una restricción NOT NULL en la columna `client_phone`, lo que genera un error de base de datos: "null value in column client_phone violates not-null constraint".

## What Changes

- Hacer el campo `client_phone` obligatorio en el formulario de contacto del booking público
- Agregar validación de requerido al campo teléfono con mensaje de error visible
- Actualizar el texto descriptivo del paso para reflejar que el teléfono es obligatorio
- Eliminar la validación custom `atLeastOneContactValidator` ya que teléfono será siempre requerido

## Capabilities

### New Capabilities
- `booking-phone-validation`: Validación obligatoria del teléfono en el formulario de reserva pública

### Modified Capabilities
<!-- No existing capabilities to modify -->

## Impact

- **Componente afectado**: `app-web/src/app/features/public/booking-form/booking-form.component.ts` - Cambiar validación de `client_phone` de opcional a requerido
- **Componente afectado**: `app-web/src/app/features/public/booking-form/steps/contact-form-step/contact-form-step.component.html` - Actualizar label y mensajes de error
- **Componente afectado**: `app-web/src/app/features/public/booking-form/steps/contact-form-step/contact-form-step.component.ts` - Actualizar lógica de detección de errores
- **Base de datos**: Sin cambios (la restricción NOT NULL ya existe)
