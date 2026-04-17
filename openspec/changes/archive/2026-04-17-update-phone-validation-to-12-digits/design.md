# Design: Actualizar validación de teléfono a 12 dígitos

## Enfoque técnico

Se modifican 4 ubicaciones en el código:

1. **Phone Validator**: Cambiar `minLength` de 10 a 12 en línea 29
2. **Mensaje de error validator**: Cambiar "10 dígitos" a "12 dígitos"
3. **Validación onSubmit**: Cambiar `minLength` de 10 a 12 en línea 269
4. **Mensaje de error submit**: Cambiar "10 dígitos" a "12 dígitos"

## No hay cambios de arquitectura

- Solo se modifica el valor numérico en las validaciones existentes
- No hay cambios en la estructura del formulario
- No hay cambios en la UI