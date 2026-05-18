## Context

El formulario de booking público tiene un validador custom `atLeastOneContactValidator()` que permite enviar con solo email o solo teléfono. Sin embargo, la tabla `appointments` en la base de datos tiene `client_phone` como NOT NULL, causando errores al enviar sin teléfono.

## Goals / Non-Goals

**Goals:**
- Hacer `client_phone` requerido con `Validators.required`
- Mantener validación de mínimo 10 dígitos
- Mostrar mensajes de error claros al usuario
- Eliminar lógica innecesaria (`atLeastOneContactValidator`)

**Non-Goals:**
- No cambiar el esquema de base de datos (NOT NULL se mantiene)
- No afectar otros formularios del backoffice

## Decisions

### Decision: Agregar Validators.required a client_phone y eliminar atLeastOneContactValidator

**Approach**: 
1. Cambiar `client_phone: ['']` a `client_phone: ['', [Validators.required]]` en el bookingForm
2. Eliminar el validador custom `atLeastOneContactValidator()` del form group
3. Actualizar el template para mostrar el label de teléfono con asterisco (*)
4. Actualizar el subtítulo del paso para remover "Ingresa al menos un teléfono o email"
5. Simplificar `hasContactError` en el contact-form-step component ya que no será más necesario

**Rationale**: Es la solución más directa. El teléfono es requerido por la BD, entonces debe ser requerido en el form. Esto elimina la complejidad del validador custom que ya no tiene propósito.

### Decision: Mantener validación de 10 dígitos como cross-field validator simplificado

**Approach**: La validación de 10 dígitos se puede manejar con un validator simple en el campo `client_phone` en lugar de un cross-field validator, ya que no necesitamos la lógica de "al menos uno de los dos".

**Rationale**: Simplifica el código y hace la validación más predecible.

## Risks / Trade-offs

- **[Riesgo] Usuarios sin teléfono**: Algunos usuarios podrían no querer compartir su teléfono. → **Mitigación**: El teléfono es necesario para la operación del negocio de citas. Este es un requerimiento de negocio, no técnico.
