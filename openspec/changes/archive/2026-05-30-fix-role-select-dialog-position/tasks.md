## 1. Refactorizar template del diálogo de usuario

- [x] 1.1 Reemplazar `p-select` del campo Rol por un grupo de 3 botones/card usando `@for` sobre `roleOptions`
- [x] 1.2 Implementar binding `(click)` para actualizar `userFormData().role` y estado visual activo en la opción seleccionada
- [x] 1.3 Verificar que el checkbox condicional "Puede actuar como empleado" sigue apareciendo al seleccionar "Manager"

## 2. Actualizar estilos del componente

- [x] 2.1 Agregar clases SCSS para el grupo de selección de roles (`role-select-group`, `role-option`) siguiendo los design tokens del proyecto
- [x] 2.2 Asegurar estados hover, active y selected con los colores del sistema (`--color-sage`, `--color-sage-pale`, `--color-linen`)

## 3. Limpiar imports y código obsoleto

- [x] 3.1 Remover `SelectModule` de los imports del componente TypeScript (restaurado — otros selects del componente aún lo requieren)
- [x] 3.2 Verificar que el componente compila sin errores
