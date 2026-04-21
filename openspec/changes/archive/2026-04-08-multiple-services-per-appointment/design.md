## Context

holacitas es un sistema de reservas de citas donde clientes pueden agendar servicios con empleados de empresas. Actualmente, el modelo de datos tiene una relación 1:1 entre `appointments` y `services`, donde cada cita solo puede tener un servicio asociado.

**Estado actual:**
- Tabla `appointments` tiene campo `service_id` (FK a `services`)
- Booking público permite seleccionar solo 1 servicio
- Historial de citas muestra el servicio como un único campo

**Stakeholders:**
- Clientes: necesitan reservar múltiples servicios en una visita
- Empleados: necesitan agregar/quitar servicios durante la cita
- Managers: necesitan modificar servicios en citas pendientes
- Sistema: necesita calcular duración y precio total automáticamente

**Constraints:**
- Migración gradual por capas (DB → Backend → UI Booking → UI Backoffice)
- Compatibilidad con datos existentes
- Rollback debe ser posible sin perder datos
- RLS policies en Supabase para seguridad

## Goals / Non-Goals

**Goals:**
- Implementar relación N:N entre appointments y services mediante tabla intermedia
- Permitir selección múltiple de servicios en booking público
- Permitir edición de servicios en citas pendientes (empleado y manager)
- Calcular automáticamente duración total y precio total
- Validar disponibilidad con duración total de servicios
- Mostrar servicios como lista compacta en todas las vistas

**Non-Goals:**
- Servicios en paralelo (se deja la puerta abierta para futuro)
- Orden de servicios (el empleado decide durante la cita)
- Paquetes con descuento o precios especiales
- Límite configurable de servicios por empresa
- Edición de servicios en citas completadas/canceladas

## Decisions

### 1. Relación en base de datos: Tabla intermedia vs JSON array

**Decisión:** Tabla intermedia `appointment_services(appointment_id, service_id)`

**Alternativas consideradas:**
- **JSON array en appointments**: Simpler, sin tabla adicional, pero:
  - No permite queries eficientes (JOINs)
  - No mantiene integridad referencial
  - Difícil de indexar
  - No escalable si se necesitan metadatos adicionales

- **Tabla intermedia con campos extra**: Más flexible para cantidad, orden, notas, pero:
  - Complejidad innecesaria para MVP
  - Un servicio no puede repetirse en la misma cita (requisito actual)

**Racional:**
- Tabla intermedia simple es el patrón estándar para N:N
- Permite JOINs eficientes con Supabase
- Mantiene integridad referencial con FKs
- Escalable si se necesitan campos adicionales en el futuro
- Soporta RLS policies

### 2. Migración de datos: Copy-then-delete vs In-place migration

**Decisión:** Copy-then-delete (fase posterior)

**Alternativas consideradas:**
- **In-place migration** (eliminar service_id inmediatamente):
  - Más rápido
  - Rollback difícil si hay errores en frontend

- **Copy-then-delete** (mantener service_id temporalmente):
  - Permite rollback sin perder datos originales
  - Sistema puede funcionar con ambos campos durante transición
  - Más seguro para producción

**Racional:**
- Migración de datos es crítica, errores pueden causar pérdida de información
- Mantener `service_id` como backup durante implementación inicial
- Eliminar campo solo después de verificar que todo funciona
- Fases: 
  1. Crear `appointment_services` y poblar
  2. Implementar frontend
  3. Verificar en producción
  4. Eliminar `service_id` en migración posterior

### 3. Interfaz de selección: Checkboxes vs Chips vs Dropdown

**Decisión:** Checkboxes

**Alternativas consideradas:**
- **Chips**: Más visual, permite drag-and-drop para ordenar, pero:
  - Requiere más código
  - No mantiene compatibilidad con interfaz actual

- **Dropdown múltiple**: Compacto, familiar, pero:
  - Menos intuitivo para seleccionar múltiples
  - Requiere expandir/collapse

- **Checkboxes**: Simple, familiar, accesible
  - Mantiene compatibilidad con layout actual
  - Fácil de implementar con PrimeNG
  - Permite ver todos los servicios de una vez

**Racional:**
- Compatibilidad con interfaz actual es prioritaria
- Checkboxes es el componente más simple y probado
- PrimeNG ya tiene `CheckboxModule` disponible
- No requiere orden de servicios (el empleado decide durante la cita)

### 4. Cálculo de duración: Secuencial vs Paralelo

**Decisión:** Secuencial (suma simple), extensible para futuro

**Alternativas consideradas:**
- **Paralelo**: Algunos servicios pueden realizarse simultáneamente
  - Requiere marcar cada servicio como "permite paralelo"
  - Complejidad en validación de disponibilidad
  - No hay requisito claro aún

- **Mixto**: Combinación de secuencial y paralelo
  - Máxima flexibilidad
  - Mayor complejidad de implementación
  - Over-engineering para MVP

**Racional:**
- MVP: secuencial es simple y cubre la mayoría de casos
- Deja la puerta abierta para agregar campo `allows_parallel` en `services` en el futuro
- Validación de disponibilidad es straightforward (suma de duraciones)
- No afecta UI, solo backend

### 5. Visualización: Lista vertical vs Chips vs Texto compacto

**Decisión:** Texto compacto con comas

**Alternativas consideradas:**
- **Lista vertical**: Más legible, mejor para muchos servicios
  - Ocupa más espacio
  - Desordena tablas compactas

- **Chips**: Visual, moderno, permite interacción
  - Requiere más espacio horizontal
  - Difícil de mostrar en tablas estrechas

- **Texto compacto**: "Corte, Barba, Tratamiento"
  - Mínimo espacio
  - Fácil de mostrar en tablas
  - Permite tooltip con detalles si es necesario

**Racional:**
- Tablas de historial tienen espacio limitado
- Formato compacto es suficiente para el caso de uso actual
- Se puede expandir en el detalle de la cita
- Implementación simple sin componentes adicionales

## Risks / Trade-offs

### Riesgo 1: Migración de datos pierde información
**Riesgo:** El script de migración puede fallar y no crear todos los registros en `appointment_services`, perdiendo datos existentes.

**Mitigación:**
- Script de migración verifica conteo antes de confirmar
- Transacción con rollback automático si hay errores
- Mantener `service_id` en `appointments` hasta verificar
- Backup de base de datos antes de migración

### Riesgo 2: Disponibilidad incorrecta con múltiples servicios
**Riesgo:** Al calcular disponibilidad con duración total, puede haber conflictos con otras citas si los servicios seleccionados exceden el tiempo disponible.

**Mitigación:**
- Validación en tiempo real al seleccionar servicios
- Cálculo de duración total antes de validar disponibilidad
- Mensaje claro al usuario: "Los servicios seleccionados exceden el tiempo disponible"
- Query que considera todas las citas del empleado en ese día

### Riesgo 3: Edición de servicios causa conflictos de disponibilidad
**Riesgo:** Un empleado agrega servicios a una cita pendiente y causa conflicto con la siguiente cita.

**Mitigación:**
- Validación de disponibilidad al agregar servicios
- Excluir la cita actual de la validación (ya está reservada)
- Si la nueva duración excede el tiempo disponible, mostrar error
- El empleado debe elegir: quitar servicios o cambiar horario

### Riesgo 4: Rollback complejo
**Riesgo:** Si algo falla después de eliminar `service_id`, el rollback es complejo.

**Mitigación:**
- NO eliminar `service_id` en la primera fase
- Implementar todo con tabla intermedia primero
- Verificar en producción con ambos campos presentes
- Solo eliminar `service_id` en migración posterior (meses después)

### Trade-off 1: Performance vs Normalización
**Trade-off:** JOIN con `appointment_services` es más lento que campo directo, pero es necesario para N:N.

**Mitigación:**
- Índices en `appointment_services(appointment_id)` y `(service_id)`
- Queries optimizadas con Supabase (INNER JOIN)
- Cargar servicios solo cuando se necesitan (lazy loading en historial)
- Memoización en frontend para evitar queries repetidos

### Trade-off 2: Complejidad de UI vs Flexibilidad
**Trade-off:** Checkboxes son simples, pero no permiten ordenar servicios si se requiere en el futuro.

**Mitigación:**
- Orden no es requisito actual (el empleado decide)
- Si se requiere orden en el futuro, se puede agregar drag-and-drop
- La tabla intermedia ya soporta agregar campo `order` si es necesario

## Migration Plan

### Fase 1: Base de datos
**Duración:** 1-2 días

**Pasos:**
1. Crear tabla `appointment_services` con índices
2. Crear RLS policies
3. Ejecutar script de migración (`INSERT INTO appointment_services SELECT id, service_id FROM appointments`)
4. Verificar conteo: `SELECT COUNT(*) FROM appointments WHERE service_id IS NOT NULL` debe igualar `SELECT COUNT(*) FROM appointment_services`
5. Mantener campo `service_id` en `appointments` (NO eliminar aún)

**Rollback:**
```sql
DELETE FROM appointment_services;
-- service_id permanece intacto
```

### Fase 2: Backend
**Duración:** 2-3 días

**Pasos:**
1. Crear modelo `AppointmentService` y DTOs actualizados
2. Actualizar `Appointment` model sin eliminar `service_id`
3. Modificar `AppointmentService.create()` para usar `appointment_services`
4. Agregar `AppointmentService.updateServices()`
5. Actualizar queries con JOIN a `appointment_services`
6. Testing unitario y de integración

**Rollback:**
- Revertir commits de backend
- Sistema sigue funcionando con `service_id`

### Fase 3: UI Booking
**Duración:** 2-3 días

**Pasos:**
1. Modificar `EmployeeCalendarComponent`: checkboxes en lugar de dropdown
2. Implementar cálculo de duración total y precio total
3. Validar disponibilidad con duración total
4. Modificar `BookingFormComponent`: recibir `serviceIds` query param
5. Mostrar lista de servicios seleccionados
6. Testing manual del flujo completo

**Rollback:**
- Revertir commits de UI booking
- Frontend vuelve a usar `service_id`

### Fase 4: UI Backoffice
**Duración:** 2-3 días

**Pasos:**
1. Modificar `EmployeeHistoryComponent`: mostrar servicios como texto
2. Modificar `AppointmentDetailDialogComponent`: permitir edición de servicios
3. Modificar `AppointmentsComponent`: mostrar lista de servicios
4. Implementar validación de disponibilidad al editar
5. Testing manual de todas las vistas

**Rollback:**
- Revertir commits de UI backoffice
- Frontend vuelve a mostrar servicio único

### Fase 5: Verificación y cleanup
**Duración:** 1 día

**Pasos:**
1. Verificar en producción que todo funciona
2. Monitorear logs de errores
3. Verificar que no hay citas huérfanas
4. **NO eliminar `service_id` aún** (esperar 1-2 semanas)

### Fase 6 (posterior): Eliminación de campo legacy
**Duración:** 1 día

**Pasos:**
1. Verificar que todas las citas nuevas usan `appointment_services`
2. Verificar que no hay reads de `service_id` en código
3. Ejecutar migración: `ALTER TABLE appointments DROP COLUMN service_id`
4. Actualizar modelos para eliminar campo

**Rollback:**
- No hay rollback simple
- Restaurar backup de base de datos

## Open Questions

1. **¿Se debe agregar campo `order` en `appointment_services` para futuro?**
   - No es necesario para MVP (el empleado decide el orden)
   - Dejar la puerta abierta: agregar en migración posterior si se requiere

2. **¿Se debe permitir repetir el mismo servicio en una cita?**
   - No es requisito actual
   - La tabla intermedia con PRIMARY KEY compuesto previene duplicados
   - Si se requiere en el futuro, cambiar a unique constraint diferente

3. **¿Cómo manejar servicios con precios variables o descuentos?**
   - Fuera del alcance actual (precio = suma simple)
   - Dejar en backlog para futuro: tabla `appointment_service_prices` con precio final

4. **¿Se debe agregar campo `notes` en `appointment_services`?**
   - No es requisito actual
   - Si se requiere en el futuro, migración simple: `ALTER TABLE appointment_services ADD COLUMN notes TEXT`

5. **¿Cómo afecta esto a reportes y analytics?**
   - Queries de reportes deben cambiar de `appointments.service_id` a JOIN con `appointment_services`
   - Implementación posterior: actualizar dashboards y reportes

## Implementation Order

1. `supabase/migrations/YYYYMMDD_create_appointment_services.sql`
2. `supabase/migrations/YYYYMMDD_migrate_appointment_services_data.sql`
3. `src/app/core/models/appointment-service.model.ts` (nuevo)
4. `src/app/core/models/appointment.model.ts` (modificar)
5. `src/app/core/services/appointment.service.ts` (modificar)
6. `src/app/features/public/employee-calendar/employee-calendar.component.ts` (modificar)
7. `src/app/features/public/employee-calendar/employee-calendar.component.html` (modificar)
8. `src/app/features/public/booking-form/booking-form.component.ts` (modificar)
9. `src/app/features/public/booking-form/booking-form.component.html` (modificar)
10. `src/app/features/backoffice/employee/history/employee-history.component.ts` (modificar)
11. `src/app/features/backoffice/employee/history/employee-history.component.html` (modificar)
12. `src/app/features/backoffice/employee/history/appointment-detail-dialog.component.ts` (modificar)
13. `src/app/features/backoffice/employee/history/appointment-detail-dialog.component.html` (modificar)
14. `src/app/features/backoffice/manager/appointments/appointments.component.ts` (modificar)
15. `src/app/features/backoffice/manager/appointments/appointments.component.html` (modificar)
16. `scripts/migrate-appointment-services.ts` (nuevo)
17. `scripts/rollback-appointment-services.ts` (nuevo)
18. Tests unitarios y de integración