## Why

El panel lateral (p-drawer) utilizado para completar, cancelar o marcar citas como "no asistió" en la página de citas (`/bo/appointments`) carece de estilos acordes al diseño visual de la aplicación. El drawer se muestra con apariencia plana y sin personalización, rompiendo la coherencia visual del backoffice y dando una experiencia de usuario de baja calidad.

## What Changes

- Aplicar estilos visuales al drawer de actualización de estado de citas para alinearlo con el design system de la aplicación.
- Incluir: fondo personalizado, header con icono de acción estilizado, tipografía coherente, inputs con estilos de marca, y botones de acción alineados al sistema de diseño.
- Asegurar que los estilos utilicen CSS custom properties (design tokens) definidos en el proyecto.

## Capabilities

### New Capabilities

### Modified Capabilities

### Modified Capabilities
- `appointment-management`: Actualizar estilos visuales del drawer de cambio de estado de citas. No cambia comportamiento funcional.

## Impact

- Archivo afectado: `app-web/src/app/features/backoffice/manager/appointments/appointments.component.scss`
- Sin impacto en APIs, base de datos o dependencias externas.
