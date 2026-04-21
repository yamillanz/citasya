# Design: Daily Close Hybrid Panel

## Context

El componente `DailyCloseComponent` actual en `/bo/close` es un generador de PDF pasivo. El manager debe ir a `/bo/appointments` para cerrar citas individualmente y luego regresar a `/bo/close` para generar el reporte. Esto fragmenta el flujo de trabajo y no permite ver totales acumulados por empleado mientras se trabaja.

**Stakeholders:**
- Managers: Necesitan cerrar citas y ver totales de forma eficiente
- Empleados: Sus pagos semanales dependen de los montos registrados

**Constraints:**
- Usar el schema existente: `appointments.status`, `appointments.amount_collected`
- Mantener el servicio `DailyCloseService` para generación de PDF
- Usar el servicio `AppointmentService` existente (`getByDate`, `updateStatus`)
- Responsive: debe funcionar en desktop y móvil
- PrimeNG como framework de UI

## Goals / Non-Goals

**Goals:**
- Unificar el flujo de cierre de citas y visualización de totales en una sola interfaz
- Permitir búsqueda rápida de empleados
- Soportar listas extensas de empleados con scroll
- Actualizar totales en tiempo real al cerrar citas
- Mantener la generación de PDF existente

**Non-Goals:**
- Configuración de split empleado/empresa (será otro cambio futuro)
- Edición de servicios o empleados (fuera de scope)
- Calendario mensual o semanal (solo navegación día a día)

## Decisions

### Decision 1: Split-View Layout

**Choice:** Panel izquierdo (30%) + Panel derecho (70%)

**Alternatives considered:**
1. **Tabs por empleado**: Cada empleado en un tab — rechazado porque no permite ver totales de todos a la vez
2. **Tabla única con filtros**: Todo en una tabla — rechazado porque fragmenta la vista por empleado
3. **Split-view**: Permite ver contexto global y trabajar en detalle simultáneamente — **selected**

**Rationale:** El split-view permite al manager ver el estado global (totales de todos los empleados) mientras trabaja en el detalle de uno específico, manteniendo contexto sin cambiar de vista.

### Decision 2: Estado Reactivo con Signals

**Choice:** Usar Angular Signals para todo el estado

**Implementation:**
```typescript
selectedDate = signal(new Date());
selectedEmployee = signal<User | null>(null);
searchQuery = signal('');
appointments = signal<Appointment[]>([]);

employees = computed(() => 
  [...new Set(this.appointments().map(a => a.employee_id))]
    .map(id => this.employeesMap.get(id))
    .filter(Boolean)
);

filteredEmployees = computed(() => 
  this.employees().filter(e => 
    e.name.toLowerCase().includes(this.searchQuery().toLowerCase())
  )
);

employeeStats = computed(() => {
  // Returns Map<employeeId, { total: number, completed: number, pending: number }>
});

appointmentsByEmployee = computed(() => {
  // Returns appointments for selectedEmployee
});

dayStats = computed(() => {
  // Returns { totalAmount, totalAppointments, completedCount, pendingCount }
});
```

**Rationale:** Signals proporcionan reactividad automática y eficiente. Los totales se recalculan automáticamente cuando cambia cualquier cita.

### Decision 3: Cierre Inline vs Modal

**Choice:** Mini-drawer lateral para ingresar monto al completar

**Alternatives considered:**
1. **Modal dialog**: Más intrusive, rompe el flujo visual
2. **Inline con input directo**: Puede causar errores si el usuario hace clic accidental
3. **Drawer lateral**: Permite ver la cita mientras ingresa el monto — **selected**

**Implementation:**
- Click en "Completar" abre un drawer desde la derecha
- Drawer muestra: Cliente, Servicio, Precio sugerido (si existe)
- Input numérico para monto con validación
- Botones "Confirmar" y "Cancelar"

**Rationale:** El drawer permite mantener el contexto visual de la cita mientras se ingresa el monto, sin bloquear toda la pantalla como un modal.

### Decision 4: Scroll Virtualizado para Lista Larga

**Choice:** Scroll nativo con max-height CSS

**Alternatives considered:**
1. **Virtual scroll (Angular CDK)**: Overkill para este caso, complejidad adicional
2. **Paginación**: Rompe la experiencia de búsqueda
3. **Scroll nativo con altura fija**: Simple y efectivo — **selected**

**Implementation:**
```scss
.employee-list {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}
```

**Rationale:** Para el número esperado de empleados por salón (10-50), el scroll nativo es suficiente. Virtual scroll se agregaría solo si hay problemas de rendimiento.

### Decision 5: Navegación de Fechas

**Choice:** Flechas ← → y Datepicker de PrimeNG

**Implementation:**
- Botones de navegación: `[← Ayer] [Fecha actual] [Mañana →]`
- Datepicker para seleccionar fecha específica
- Deshabilitar fechas futuras (no se pueden cerrar citas futuras)

**Rationale:** Las flechas permiten navegación rápida día a día. El datepicker permite saltar a fechas específicas.

## Risks / Trade-offs

### Risk: Performance con muchas citas por empleado
- **Mitigation:** Usar `computed()` signals que solo recalculan dependencias afectadas. Paginar citas por empleado si excede 20.

### Risk: Concurrencia si múltiples managers cierran el mismo día
- **Mitigation:** No aplica — normalmente un solo manager por empresa. Si hay múltiples, el último estado persiste (comportamiento aceptable para cierre diario).

### Risk: Pérdida de datos si se cierra el navegador antes de guardar
- **Mitigation:** Los cambios se guardan inmediatamente en cada acción (completar, cancelar, no-show). No hay estado en memoria pendiente de guardar.

### Risk: Confusión entre "fecha del reporte" y "estado actual"
- **Mitigation:** Clarificar en UI: "Cierre del día X" con fecha visible. Al cambiar de fecha, limpiar selección de empleado.

## Migration Plan

1. **Fase 1: Despliegue del nuevo componente**
   - Reemplazar el contenido de `DailyCloseComponent` sin cambiar la ruta `/bo/close`
   - El menú "Cierre Diario" ya apunta a `/bo/close`

2. **Fase 2: Monitoreo**
   - Verificar que el PDF de cierre sigue funcionando
   - Verificar que los estados de citas se actualizan correctamente

3. **Fase 3: Limpieza (opcional)**
   - Si el flujo de Appointments para cerrar citas no se usa más, considerar eliminar o simplificar

**Rollback:** Revertir el commit del componente. El schema de base de datos no cambia.

## Open Questions

1. ¿Debe el manager poder editar el monto después de haber completado una cita? → **Decisión: Sí, permitir editar desde el drawer hasta que se genere el cierre del día**
2. ¿Mostrar precio sugerido del servicio en el drawer? → **Decisión: Sí, mostrar como referencia pero permitir editar**
3. ¿Deshabilitar "Generar Cierre" si hay citas pendientes? → **Decisión: Mostrar advertencia pero permitir continuar**