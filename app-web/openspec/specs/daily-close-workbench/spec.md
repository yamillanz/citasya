# daily-close-workbench Specification

## Purpose
TBD - created by archiving change daily-close-hybrid-panel. Update Purpose after archive.
## Requirements
### Requirement: Panel split-view con lista de empleados y detalle de citas

El sistema SHALL mostrar una interfaz con dos paneles:
- Panel izquierdo (30%): Lista de empleados del día con buscador y totales por empleado
- Panel derecho (70%): Detalle de citas del empleado seleccionado

#### Scenario: Visualizar panel con empleados y citas

- **WHEN** el manager navega a `/bo/close`
- **THEN** el sistema muestra el panel split-view con la lista de empleados a la izquierda y área de detalle a la derecha

#### Scenario: Panel izquierdo Responsive

- **WHEN** la pantalla tiene menos de 768px de ancho
- **THEN** el panel izquierdo se colapsa y se muestra como drawer o pestaña

### Requirement: Búsqueda de empleados

El sistema SHALL permitir al manager buscar empleados por nombre o email en el panel izquierdo.

#### Scenario: Búsqueda exitosa por nombre

- **WHEN** el manager escribe "María" en el campo de búsqueda
- **THEN** la lista de empleados se filtra mostrando solo empleados cuyo nombre contenga "María"

#### Scenario: Búsqueda sin resultados

- **WHEN** el manager escribe un término que no coincide con ningún empleado
- **THEN** se muestra un mensaje "No se encontraron empleados"

#### Scenario: Limpiar búsqueda

- **WHEN** el manager limpia el campo de búsqueda
- **THEN** se muestran todos los empleados del día

### Requirement: Lista de empleados con scroll vertical

El sistema SHALL mostrar la lista de empleados con scroll vertical cuando la lista excede la altura del contenedor.

#### Scenario: Scroll visible para lista extensa

- **WHEN** hay más empleados de los que caben en el panel izquierdo
- **THEN** se habilita scroll vertical para navegar la lista

#### Scenario: Scroll hasta empleado seleccionado

- **WHEN** el manager selecciona un empleado que no está visible
- **THEN** el scroll se posiciona automáticamente para mostrar el empleado seleccionado

### Requirement: Totales por empleado

El sistema SHALL mostrar para cada empleado:
- Subtotal en pesos de citas completadas
- Cantidad de citas totales
- Cantidad de citas completadas vs pendientes
- Indicador visual de progreso

#### Scenario: Visualizar totales de empleado

- **WHEN** el manager ve la lista de empleados
- **THEN** cada empleado muestra sus totales del día actualizados en tiempo real

#### Scenario: Actualización de totales al completar cita

- **WHEN** el manager completa una cita con monto
- **THEN** los totales del empleado se recalculan y actualizan inmediatamente

### Requirement: Selección de empleado

El sistema SHALL permitir seleccionar un empleado de la lista para ver sus citas del día.

#### Scenario: Seleccionar empleado

- **WHEN** el manager hace clic en un empleado de la lista
- **THEN** el empleado se resalta como seleccionado y sus citas aparecen en el panel derecho

#### Scenario: Cambiar empleado seleccionado

- **WHEN** el manager selecciona otro empleado
- **THEN** el panel derecho se actualiza con las citas del nuevo empleado seleccionado

### Requirement: Cerrar cita como Completada

El sistema SHALL permitir al manager marcar una cita como completada e ingresar el monto cobrado.

#### Scenario: Completar cita con monto

- **WHEN** el manager hace clic en "Completar" en una cita pendiente
- **THEN** se abre un input o modal para ingresar el monto
- **AND** al confirmar, la cita cambia a estado "completed"
- **AND** el monto se guarda en `amount_collected`

#### Scenario: Monto requerido para completar

- **WHEN** el manager intenta completar una cita sin ingresar monto
- **THEN** se muestra error "El monto es requerido"

#### Scenario: Actualización de estado visual

- **WHEN** una cita se marca como completada
- **THEN** el badge de estado cambia a verde con texto "Completada"
- **AND** los totales del empleado se actualizan

### Requirement: Marcar cita como No Asistió

El sistema SHALL permitir al manager marcar una cita como "no_show" cuando el cliente no se presenta.

#### Scenario: Marcar como No Asistió

- **WHEN** el manager hace clic en "No Asistió" en una cita
- **THEN** la cita cambia a estado "no_show"
- **AND** no se requiere monto

#### Scenario: Confirmación de No Asistió

- **WHEN** el manager hace clic en "No Asistió"
- **THEN** se muestra diálogo de confirmación
- **AND** al confirmar, el estado cambia

### Requirement: Cancelar cita

El sistema SHALL permitir al manager cancelar una cita desde el panel de cierre diario.

#### Scenario: Cancelar cita

- **WHEN** el manager hace clic en "Cancelar" en una cita
- **THEN** se muestra diálogo de confirmación
- **AND** al confirmar, la cita cambia a estado "cancelled"

### Requirement: Navegación de fechas

El sistema SHALL permitir navegar entre días para ver y cerrar citas de días anteriores o futuros.

#### Scenario: Ir al día anterior

- **WHEN** el manager hace clic en la flecha izquierda (←)
- **THEN** la vista se actualiza con las citas del día anterior

#### Scenario: Ir al día siguiente

- **WHEN** el manager hace clic en la flecha derecha (→)
- **THEN** la vista se actualiza con las citas del día siguiente

#### Scenario: Seleccionar fecha específica

- **WHEN** el manager selecciona una fecha en el calendario
- **THEN** la vista se actualiza con las citas de esa fecha

#### Scenario: Fecha no futura

- **WHEN** el manager intenta navegar a una fecha futura
- **THEN** el sistema no permite navegar más allá de hoy

### Requirement: Vista de citas por empleado

El sistema SHALL mostrar las citas del empleado seleccionado con:
- Hora de la cita
- Nombre del cliente
- Servicio(s) agendados
- Estado actual
- Monto (si completada)
- Botones de acción

#### Scenario: Ver citas del empleado

- **WHEN** el manager selecciona un empleado
- **THEN** se muestran sus citas del día ordenadas por hora

#### Scenario: Sin citas en el día

- **WHEN** el empleado seleccionado no tiene citas en el día
- **THEN** se muestra mensaje "Sin citas programadas"

### Requirement: Totales del día

El sistema SHALL mostrar un resumen de totales del día:
- Monto total recaudado
- Cantidad total de citas
- Citas completadas vs pendientes
- Barra de progreso visual

#### Scenario: Ver resumen del día

- **WHEN** el manager está en la vista de cierre
- **THEN** ve el resumen de totales actualizado con los datos del día

#### Scenario: Actualización en tiempo real

- **WHEN** el manager completa una cita
- **THEN** el resumen del día se actualiza inmediatamente

### Requirement: Generar PDF de cierre diario

El sistema SHALL permitir generar un PDF con el resumen del cierre del día después de completar las citas.

#### Scenario: Generar cierre del día

- **WHEN** el manager hace clic en "Generar Cierre"
- **THEN** se genera un PDF con los datos del día
- **AND** se guarda un registro en la tabla `daily_closes`

#### Scenario: Día ya cerrado

- **WHEN** el día ya tiene un registro de cierre en `daily_closes`
- **THEN** se muestra advertencia "Este día ya fue cerrado"
- **AND** se puede regenerar el PDF pero no modificar estados

### Requirement: Estados de Loading y Error

El sistema SHALL mostrar estados de loading y error apropiados.

#### Scenario: Loading inicial

- **WHEN** la vista se carga inicialmente
- **THEN** se muestra skeleton o spinner mientras cargan datos

#### Scenario: Error de carga

- **WHEN** hay un error al cargar las citas
- **THEN** se muestra mensaje de error con botón de reintentar

### Requirement: Notificaciones Toast

El sistema SHALL mostrar notificaciones toast para confirmar acciones exitosas y errores.

#### Scenario: Cita completada exitosamente

- **WHEN** el manager completa una cita exitosamente
- **THEN** se muestra toast de éxito "Cita completada"

#### Scenario: Error al actualizar estado

- **WHEN** hay un error al actualizar el estado
- **THEN** se muestra toast de error con el mensaje correspondiente

