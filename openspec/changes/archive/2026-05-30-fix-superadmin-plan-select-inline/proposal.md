# Fix: Select de Plan en Tabla de Empresas (Superadmin)

## Intent

El select inline de planes en la tabla de empresas del panel de superadministrador no funciona correctamente: el dropdown se corta visualmente porque la tabla tiene `responsiveLayout="scroll"` que aplica `overflow-x: auto` al contenedor. Esto impide seleccionar un plan diferente al editar una fila inline.

El objetivo es eliminar el inline editing del campo plan en la tabla y redirigir la edición al `p-dialog` de empresa que ya existe y funciona correctamente (su select de plan no está dentro de un contenedor con overflow).

## Scope

### In
- Eliminar el `p-cellEditor` del campo **Plan** en la tabla de empresas.
- Modificar el botón de editar fila para que abra el dialog de edición de empresa en lugar de activar el inline editing de la fila completa.
- Ajustar la lógica TypeScript: eliminar métodos de clonado/cancelado de fila de empresa que ya no sean necesarios, o adaptarlos si se mantiene inline editing para nombre/slug.
- Revisar y limpiar estilos SCSS relacionados con la fila editable si ya no aplican.

### Out
- No modificar la tabla de usuarios (aunque tiene el mismo patrón con rol, está fuera del scope de este fix).
- No modificar el comportamiento de los filtros de plan ni del select de plan en el dialog (ya funciona).
- No cambiar el diseño visual general de la página.

## Approach

1. **Diagnóstico**: El `p-select` del plan se renderiza dentro de `p-cellEditor` en una tabla con `responsiveLayout="scroll"`. PrimeNG aplica `overflow-x: auto` al wrapper de la tabla, creando un *clipping context* que corta cualquier overlay (dropdown) que exceda los límites del contenedor. El proyecto ya documenta este bug conocido: "`p-select` dentro de contenedores con scroll tiene problemas de posicionamiento".

2. **Solución elegida (Opción 1)**: En lugar de luchar contra el posicionamiento de PrimeNG, eliminamos el inline editing del plan y usamos el `p-dialog` de edición de empresa que ya existe. El dialog tiene su propio `p-select` funcional para el plan (líneas 334-337 del HTML). El botón de editar en la fila abrirá el dialog con los datos de la empresa pre-cargados.

3. **Beneficios**:
   - Elimina completamente el bug.
   - Simplifica el código (se pueden eliminar `clonedCompanies`, `onCompanyRowEditCancel`, etc.).
   - UX más consistente: todos los campos de empresa se editan en el mismo dialog.
   - El dialog ya está implementado y probado.
