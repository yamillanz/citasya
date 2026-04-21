# Spec: SharedCalendarComponent - Scenarios

## Scenario 1: Ver calendario en vista mensual

**Given** el componente recibe una lista de 5 citas  
**And** `initialView` es `'dayGridMonth'`  
**When** el componente se renderiza  
**Then** muestra el calendario en vista de mes  
**And** el título del mes/año actual  

## Scenario 2: Toggle a vista semanal

**Given** el componente está en vista mensual  
**When** usuario clickea el botón "Semana"  
**Then** el calendario cambia a `timeGridWeek`  
**And** muestra la semana actual  

## Scenario 3: Seleccionar día y ver citas

**Given** hay 3 citas para el día 15  
**When** usuario clickea en el día 15 del calendario  
**Then** aparece sección "Citas del 15 de [mes]"  
**And** se muestran las 3 citas en lista  

## Scenario 4: Día sin citas

**Given** el día 20 no tiene citas  
**When** usuario clickea en el día 20  
**Then** aparece mensaje "No hay citas para este día"  
**And** no hay lista de citas  

## Scenario 5: Sin día seleccionado

**Given** acaba de cargarse el componente  
**When** no se ha seleccionado ningún día  
**Then** aparece mensaje "Selecciona un día para ver sus citas"  
**And** no hay lista de citas  

## Scenario 6: Click en cita abre detalles

**Given** hay una cita de "María García - Corte"  
**When** usuario clickea en la cita  
**Then** se emite `appointmentClicked` con la cita completa  
**And** el componente padre recibe el evento  

## Scenario 7: Navegación entre meses

**Given** el calendario muestra Marzo 2026  
**When** usuario clickea la flecha "siguiente"  
**Then** el calendario muestra Abril 2026  

## Scenario 8: Citas con diferentes estados

**Given** hay citas con estados: completed, pending, cancelled, no_show  
**When** se muestran en la lista  
**Then** cada cita tiene borde izquierdo del color correspondiente  
**And** el color está definido según spec de colores  

## Scenario 9: Appointments vacíos initially

**Given** `appointments` es un signal vacío  
**When** el componente se renderiza  
**Then** el calendario se muestra  
**And** la lista dice "Selecciona un día para ver sus citas"  

## Scenario 10: Recibir nuevas citas via input

**Given** el componente muestra 3 citas  
**When** el signal `appointments` se actualiza a 5 citas  
**Then** el calendario y la lista se actualizan automáticamente  
**And** solo afectan las del día seleccionado si hay día seleccionado  
