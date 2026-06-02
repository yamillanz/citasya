## Why

El componente `AppointmentsComponent` (panel de manager) tiene fetching de datos imperativo manual con `resetAndLoad()`, `loadInitialData()`, `debouncedFilterChange()` y `loading`/`employees` signals. Esto genera duplicación de código, riesgo de race conditions (filtros cambian durante `loadMore` en vuelo), y una carga manual de empleados que podría estar desacoplada del ciclo de vida del componente.

Angular 20.3.x provee `resource()` estable, una primitiva declarativa que re-carga automáticamente cuando sus dependencias reactivas cambian. Migrar a `resource()` elimina ~120 líneas de código imperativo y previene race conditions mediante un `filterGeneration` counter.

## What Changes

- Reemplazar fetching imperativo con dos `resource()` declarativos (`appointmentsResource` y `employeesResource`).
- Crear `filterParams` computed como única fuente de verdad para params de API.
- Reemplazar `loading` signal con `showLoading` computed que cubre auth init + resource loading.
- Reemplazar `employees` signal con `employeesResource.value()`.
- Agregar `debouncedSearchQuery` signal para debounce de búsqueda.
- Agregar `filterGeneration` counter para prevenir race conditions en `loadMore`.
- Eliminar `resetAndLoad()`, `loadInitialData()`, `debouncedFilterChange()`, `filterTimeout`.
- Agregar error state declarativo en template (`appointmentsResource.error()` con botón retry).
- Actualizar template: bindings de `loading()` → `showLoading()` / `appointmentsResource.isLoading()`.
- Actualizar tests: mock refleja nuevo modelo (filterParams, debouncedSearchQuery, etc.).

**BREAKING**: Ninguno a nivel de API pública. Cambio interno de implementación. La interfaz observable del componente (drawer, status, payment) se mantiene.

## Capabilities

### New Capabilities
_Ninguna._

### Modified Capabilities
- `appointments`: Los requisitos cambian en cómo se cargan, filtran, y manejan errores. Se introducen `resource()` y `filterGeneration` para prevenir race conditions. La interfaz observable del componente se mantiene.

## Impact

- **Archivos**:
  - `app-web/src/app/features/backoffice/manager/appointments/appointments.component.ts` (670 → ~590 líneas)
  - `app-web/src/app/features/backoffice/manager/appointments/appointments.component.html`
  - `app-web/src/app/features/backoffice/manager/appointments/appointments.component.scss`
  - `app-web/src/app/features/backoffice/manager/appointments/appointments.component.spec.ts`
- **APIs / Servicios**: Sin cambios. `getByCompanyPaginated()` y `getByCompany()` mantienen contrato.
- **Dependencias**: Sin nuevas. Usa `resource` de `@angular/core` (Angular 20.3.19).
- **Compatibilidad**: Total. Otros componentes no se ven afectados.
- **Tests**: 65 tests pasan (mock actualizado, no se pierden coverage).
- **Build**: Verificado con `ng build` — sin errores ni warnings nuevos.
