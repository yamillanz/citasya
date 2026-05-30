# Tasks: Fix Dialog Plan Select Overflow

## Phase 1: Fix en template

- [x] 1.1 Agregar `[appendTo]="'body'"` al `p-select` del Plan en el dialog de empresa (líneas 334-337 del HTML)
- [x] 1.2 Verificar que no hay otros `p-select` en el mismo dialog que necesiten el mismo fix

## Phase 2: Verificación

- [x] 2.1 Compilar la aplicación sin errores
- [x] 2.2 Abrir el dialog "Editar Empresa"
- [x] 2.3 Hacer click en el select de Plan
- [x] 2.4 Confirmar que el dropdown se abre completamente visible, sin cortes
- [x] 2.5 Seleccionar un plan diferente y guardar
- [x] 2.6 Verificar que el plan se actualiza correctamente en la tabla
- [x] 2.7 Verificar que no hay errores en consola del navegador
