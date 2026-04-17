## Why

Los managers necesitan un lugar centralizado para configurar los aspectos operativos de su compañía: el horario de atención y la visualización de los servicios que ofrecen con sus tarifas y comisiones. Actualmente no existe una vista de "Configuración" en el backoffice del manager, y los horarios solo se gestionan indirectamente (a través del cálculo de slots disponibles en citas). Los servicios ya se gestionan en `/bo/services`, pero no hay una vista unificada donde el manager pueda ver toda la configuración de su negocio.

## What Changes

- Crear vista de Configuración de Compañía en `/bo/settings` con tres secciones:
  1. **Información General**: Nombre de la compañía, dirección, teléfono (campos existentes de Company)
  2. **Horario del Local**: Formulario editable por día (Lunes a Domingo) con horas de inicio/fin y toggle activo/inactivo, usando ScheduleService
  3. **Servicios**: Tabla de solo lectura mostrando los servicios existentes (nombre, duración, precio, comisión) con link a `/bo/services` para editar
- Agregar ruta `settings` en `manager.routes.ts`
- Agregar item "Configuración" con ícono `pi pi-cog` en el sidebar del backoffice

## Capabilities

### New Capabilities
- `company-settings`: Vista unificada donde el manager puede ver y editar la configuración de su compañía: información general, horario de atención por día, y visualización de servicios con sus tarifas

### Modified Capabilities
- None (no se modifican capacidades existentes)

## Impact

- **Modelos**: Sin nuevos modelos (se reutilizan `Company` y `Schedule` existentes)
- **Servicios**: Sin nuevos servicios (se reutilizan `CompanyService`, `ScheduleService`, `ServiceService` existentes)
- **Componentes**: Nuevo `CompanySettingsComponent` con template y estilos
- **Rutas**: Nueva ruta `/bo/settings` en `manager.routes.ts`
- **Sidebar**: Nuevo item "Configuración" en `backoffice.component.ts`
- **Dependencias_front**: Sin nuevas dependencias (PrimeNG `p-card`, `p-inputText`, `p-button`, `p-table`, `p-inputSwitch` ya disponibles)