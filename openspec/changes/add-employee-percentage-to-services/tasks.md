# Tasks: Employee percentage field

## Implementation

- [x] 1. Agregar commission_percentage al form group (línea 47): `[50, [Validators.min(0), Validators.max(100)]]`
- [x] 2. Agregar import de SliderModule o usar p-inputNumber existente
- [x] 3. Cargar commission_percentage en loadService() - agregar al patchValue
- [x] 4. Incluir commission_percentage en onSubmit() - agregar al data payload
- [x] 5. Agregar HTML del campo en service-form.component.html después de price
- [x] 6. Agregar al preview card
- [x] 7. Actualizar tests que verifican form values

## Verificación

- [x] 8. Ejecutar tests: todos pasan (368 tests)