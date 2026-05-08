## Why

Los modales con `<ng-template pTemplate="header">` personalizado en `p-dialog` y `p-drawer` no muestran el botón de cerrar (X) en la esquina superior derecha. Esto ocurre porque el template personalizado reemplaza completamente el header por defecto de PrimeNG, incluyendo el botón X nativo. Los usuarios solo pueden cerrar estos modales mediante botones "Cancelar" o "Cerrar" en el footer, lo cual rompe la convención de UI esperada.

## What Changes

- Añadir un botón X manualmente dentro de cada custom header template que actualmente lo omite
- Estilizar el botón para que sea consistente con el diseño de PrimeNG y las guías de estilo del proyecto
- Mantener el comportamiento de cierre idéntico al de los botones del footer

## Capabilities

### New Capabilities
- `modal-close-button`: Todos los modales con header personalizado (status drawer en appointments, employee detail dialog en weekly report) muestran un botón X funcional en la esquina superior derecha del header.

## Impact

- **Components modified**:
  - `app-web/src/app/features/backoffice/manager/appointments/appointments.component.html` — añadir botón X en custom header del status drawer
  - `app-web/src/styles.scss` — estilos globales para `.status-drawer .drawer-close-btn`
  - `app-web/src/app/features/backoffice/manager/reports/weekly/employee-detail-dialog.component.html` — añadir botón X en custom header y reestructurar layout a horizontal
  - `app-web/src/app/features/backoffice/manager/reports/weekly/employee-detail-dialog.component.scss` — estilos para `.dialog-header` horizontal y `.dialog-close-btn`
- **No breaking changes**: Solo se añade un botón visual; no se modifica lógica existente
- **No API changes**
