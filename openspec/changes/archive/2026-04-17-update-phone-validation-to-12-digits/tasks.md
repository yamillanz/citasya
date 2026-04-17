# Tasks: Actualizar validación de teléfono a 12 dígitos

## Implementación

- [x] 1. Cambiar `cleanPhone.length < 10` a `cleanPhone.length < 12` en phoneValidator (línea 29)
- [x] 2. Cambiar mensaje "10 dígitos" a "12 dígitos" en phoneValidator
- [x] 3. Cambiar `phone.length < 10` a `phone.length < 12` en onSubmit (línea ~269)
- [x] 4. Cambiar mensaje "10 dígitos" a "12 dígitos" en onSubmit
- [x] 5. Actualizar tests unitarios que referencian 10 dígitos

## Verificación

- [x] 6. Ejecutar tests: todos pasan (368 tests)