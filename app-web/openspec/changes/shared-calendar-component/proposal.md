# Proposal: SharedCalendarComponent

## Why

El componente de calendario actual en `EmployeeCalendarComponent` está tightly coupled con la lógica de carga de datos y manejo de citas. Se necesita un componente reutilizable que pueda usarse en múltiples vistas (empleado, manager) manteniendo consistencia visual con el diseño de la landing page.

## What

Crear `SharedCalendarComponent` en `shared/components/calendar/` que:

- Muestre un calendario FullCalendar con vistas mensual y semanal
- Muestre lista de citas del día seleccionado debajo del calendario
- Diseño inspirado en el hero de la landing page (lista de citas con borde de color por estado)
- Reciba citas como input (el padre gestiona la carga de datos)
- Emita eventos para clicks en citas y fechas

## Success Criteria

1. Componente reutilizable en `shared/components/calendar/`
2. Vista mensual y semanal funcionando
3. Lista de citas debajo del calendario (estilo hero)
4. Colores de estado igual que ahora (completed=#9DC183, pending=#F4D03F, cancelled=#E74C3C, no_show=#95A5A6)
5. `EmployeeCalendarComponent` usa el nuevo componente
6. Tests unitarios del componente

## Impact

- Reutilización en vistas de empleado y manager
- Consistencia de UI en toda la aplicación
- Mantenimiento más fácil del código de calendario
