## Context

El componente `employee-calendar` usa FullCalendar con los plugins `dayGrid`, `timeGrid` e `interaction`. Actualmente permite seleccionar cualquier fecha sin restricciones. El calendario está configurado con `selectable: true` y maneja eventos `dateClick` y `select`.

## Goals / Non-Goals

**Goals:**
- Bloquear fechas pasadas en el calendario público de forma visual y funcional
- Mantener compatibilidad con el backoffice (sin cambios en paneles admin)
- Solución mínima y mantenible usando opciones nativas de FullCalendar

**Non-Goals:**
- No cambiar la lógica de disponibilidad de horarios
- No modificar el comportamiento del backoffice
- No agregar validación adicional en el backend (ya se encarga de rechazar fechas inválidas)

## Decisions

### Decision: Usar `validRange` de FullCalendar

**Approach**: Agregar la opción `validRange` a `calendarOptions` con `start` igual a la fecha de hoy.

```typescript
validRange: {
  start: new Date().toISOString().split('T')[0]
}
```

**Rationale**: FullCalendar tiene soporte nativo para `validRange` que:
- Deshabilita visualmente las fechas fuera del rango (estilo grayed-out)
- Bloquea interacción (clicks y drag-select) automáticamente
- No requiere lógica custom en los handlers `dateClick`/`select`
- Es la solución más simple y mantenible

**Alternative considered**: Validar manualmente en `dateClick`/`select` handlers
- Rechazado porque requiere lógica adicional, no da feedback visual inmediato, y es propenso a errores

### Decision: Calcular la fecha al inicializar el componente, no en el template

**Approach**: Calcular `validRange.start` en la definición de `calendarOptions` usando `new Date()` al momento de carga del componente.

**Rationale**: La fecha se evalúa cuando el componente se instancia, asegurando que "hoy" sea correcto. No necesita reactividad porque la fecha de "hoy" no cambia durante la vida del componente en una sesión normal.

## Risks / Trade-offs

- **[Riesgo] Zona horaria**: `new Date()` usa la zona horaria del navegador del cliente. Si un usuario está en una zona horaria diferente al servidor, podría haber discrepancias menores en el límite de "hoy". → **Mitigación**: Aceptable para este caso de uso. El backend ya valida las fechas al crear la cita.

- **[Trade-off] Navegación a meses pasados**: Con `validRange`, el usuario aún puede navegar a meses pasados con los botones prev/next, pero los días serán no seleccionables. Esto es comportamiento estándar de FullCalendar y aceptable.
