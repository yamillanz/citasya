## Why

Actualmente, cada cita solo puede tener un servicio asociado (relación 1:1 entre appointments y services). Esto limita la flexibilidad del sistema para casos de uso comunes donde un cliente necesita múltiples servicios en una misma visita (ej: corte de cabello + barba + tratamiento facial). El cliente, empleado y manager necesitan la capacidad de agregar, modificar y quitar servicios de una cita antes de que se complete.

Esta limitación afecta la experiencia del usuario y reduce la eficiencia operativa, ya que obliga a crear múltiples citas para servicios que se pueden realizar en una misma sesión.

## What Changes

- **BREAKING**: Relación appointments-services cambia de 1:1 a N:N
  - Eliminar campo `service_id` de tabla `appointments`
  - Nueva tabla intermedia `appointment_services(appointment_id, service_id)`
  
- **Nueva funcionalidad**: Selección múltiple de servicios en booking público
  - Interface con checkboxes para seleccionar múltiples servicios
  - Cálculo automático de duración total (suma de duraciones)
  - Cálculo automático de precio total (suma de precios)
  - Validación de disponibilidad con duración total

- **Nueva funcionalidad**: Edición de servicios durante la cita
  - Empleado puede agregar/quitar servicios antes de completar la cita
  - Manager puede agregar/quitar servicios antes de completar la cita
  - Validación de disponibilidad al agregar servicios
  - Restricción: mínimo 1 servicio por cita
  - Restricción: solo citas en estado `pending` pueden modificar servicios

- **Visualización**: Mostrar múltiples servicios en todas las vistas
  - Historial de empleado
  - Historial de manager
  - Detalle de cita
  - Formato: texto compacto con comas (ej: "Corte, Barba, Tratamiento")

## Capabilities

### New Capabilities

- `appointment-multi-service`: Capacidad de asociar múltiples servicios a una cita, incluyendo creación, edición y visualización

### Modified Capabilities

- `booking-form`: Modificación para soportar selección múltiple de servicios en el booking público
  - Cambio en requirements: de seleccionar 1 servicio a seleccionar 1-N servicios
  - Nueva validación: duración total no exceda disponibilidad del empleado
  
- `appointment-management`: Modificación para permitir edición de servicios en citas pendientes
  - Nuevo requirement: empleado y manager pueden agregar/quitar servicios
  - Nuevo requirement: validación de disponibilidad al agregar servicios
  - Nuevo requirement: mostrar lista completa de servicios en lugar de uno solo

## Impact

### Código afectado

- **Modelos**:
  - `Appointment`: eliminar campo `service_id`, agregar campo `services: Service[]`
  - Nuevo modelo: `AppointmentService`
  - Nuevos DTOs: `CreateAppointmentDto` (cambiar `service_id` a `service_ids`), `UpdateAppointmentServicesDto`

- **Servicios**:
  - `AppointmentService`: modificar `create()`, agregar `updateServices()`, actualizar queries
  - `ServiceService`: sin cambios mayores (ya tiene `getByEmployee()`)

- **Componentes públicos**:
  - `EmployeeCalendarComponent`: cambiar dropdown a checkboxes múltiples
  - `BookingFormComponent`: recibir y mostrar múltiples servicios, calcular totales

- **Componentes backoffice**:
  - `EmployeeHistoryComponent`: mostrar servicios como lista
  - `AppointmentDetailDialogComponent`: permitir edición de servicios
  - `AppointmentsComponent` (manager): mostrar lista de servicios

### Base de datos

- **Nueva tabla**: `appointment_services` con campos:
  - `appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE`
  - `service_id UUID REFERENCES services(id) ON DELETE RESTRICT`
  - `created_at TIMESTAMPTZ DEFAULT NOW()`
  - `PRIMARY KEY (appointment_id, service_id)`

- **Índices**: 
  - `idx_appointment_services_appointment`
  - `idx_appointment_services_service`

- **Migración de datos**: poblar `appointment_services` con datos existentes de `appointments.service_id`

- **Eliminación** (fase posterior): columna `service_id` de `appointments`

### APIs

- **Endpoint modificado**: `POST /appointments`
  - Body cambia de `{ service_id: string, ... }` a `{ service_ids: string[], ... }`

- **Nuevo endpoint**: `PATCH /appointments/:id/services`
  - Body: `{ service_ids: string[] }`
  - Solo permitido si `status === 'pending'`

### Dependencias

- No se requieren nuevas dependencias externas
- PrimeNG: ya incluye `CheckboxModule` para selección múltiple

### Sistemas afectados

- **Booking público**: flujo completo de reserva de citas
- **Panel de empleado**: visualización y edición de servicios en historial
- **Panel de manager**: gestión y detalle de citas
- **Supabase**: esquema de base de datos y RLS policies