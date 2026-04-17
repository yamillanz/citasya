# Specs: Validación de teléfono 12 dígitos

## Validator `phoneValidator`

- **Ubicación**: `app-web/src/app/features/public/booking-form/booking-form.component.ts`
- **Función**: `phoneValidator`
- **Validación actual**: `cleanPhone.length < 10` → inválido
- **Nueva validación**: `cleanPhone.length < 12` → inválido
- **Mensaje de error**: "El teléfono debe tener al menos 10 dígitos"

## Método `onSubmit`

- **Ubicación**: `app-web/src/app/features/public/booking-form/booking-form.component.ts`
- **Línea**: ~269
- **Validación actual**: `phone.length < 10`
- **Nueva validación**: `phone.length < 12`
- **Mensaje actual**: "El teléfono debe tener al menos 10 dígitos si no proporcionas email"

## Tests unitarios

- **Archivo**: `app-web/src/app/features/public/booking-form/booking-form.component.spec.ts`
- **Test**: "debe validar teléfono con mínimo 10 dígitos"
- Actualizar a 12 dígitos