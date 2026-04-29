## Context

En `booking-form.component.ts`, la función `formatPhone()` formatea la entrada del usuario con el patrón `XXX-XXX-XXXX`, limitando implícitamente a 10 dígitos. Sin embargo, el validador `atLeastOneContactValidator()` y el mensaje de error en el template exigen 12 dígitos. Esta inconsistencia bloquea completamente el envío del formulario cuando el usuario solo proporciona teléfono.

## Goals / Non-Goals

**Goals:**
- Permitir que el usuario ingrese hasta 12 dígitos en el campo de teléfono.
- Formatear visualmente números de hasta 12 dígitos de forma consistente.
- Mantener la validación de 12 dígitos cuando no se proporciona email.

**Non-Goals:**
- Cambiar la lógica de validación de email u otros campos.
- Modificar el backend o la API de reservas.
- Agregar validación de país o prefijos internacionales.

## Decisions

- **Formato para 12 dígitos**: Usar `XX-XXX-XXX-XXXX` para números de 10-12 dígitos, manteniendo `XXX-XXX-XXXX` para 10. Esto permite al usuario escribir hasta 12 dígitos sin truncamiento.
- **No usar maxlength en HTML**: El `<input>` actual no tiene `maxlength`, el límite venía del `slice(6, 10)` en `formatPhone()`. Al cambiar el `slice` a `slice(6, 12)` se resuelve.

## Risks / Trade-offs

- [Riesgo] Usuarios que esperaban solo 10 dígitos ahora pueden ingresar más, pero esto es intencional según la validación existente.
