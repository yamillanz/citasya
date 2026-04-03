## Why

Los empleados actualmente no tienen una forma rápida y accesible de compartir su enlace público de reserva con clientes. Para reservar una cita con un empleado específico, el cliente necesita el enlace `/c/<companySlug>/e/<employeeId>/book`, pero el empleado no tiene acceso directo a este enlace desde su interfaz. Esto crea fricción cuando un empleado quiere compartir su link por WhatsApp, email u otros canales.

Esta feature permite que el empleado acceda a su enlace de reserva pública con un solo click, tanto desde desktop (en el header del calendario) como desde mobile (con un FAB flotante), facilitando compartir el link con clientes potenciales.

## What Changes

- **Nueva funcionalidad**: Botón de acceso al enlace público de reserva en la vista del empleado
- **Componentes modificados**:
  - `EmployeeCalendarComponent`: Agregar botón "Reservar" en el header con icono de letra "C"
  - `EmployeeLayoutComponent`: Agregar FAB (Floating Action Button) visible solo en mobile (< 1024px)
- **Comportamiento**: Click en el botón/FAB copia el enlace público al portapapeles y muestra un toast de confirmación "Link copiado al portapapeles"

## Capabilities

### New Capabilities

- `employee-booking-link`: Permite que el empleado acceda y comparta su enlace público de reserva con un click

### Modified Capabilities

Ninguna - Esta es una nueva capacidad que no modifica specs existentes.

## Impact

**Componentes afectados**:
- `EmployeeCalendarComponent`: Nuevo botón en header
- `EmployeeLayoutComponent`: Nuevo FAB para mobile

**Archivos nuevos**:
- No se requieren archivos nuevos, solo modificaciones

**Dependencias**:
- PrimeNG `ButtonModule`, `ToastModule` (ya están importados)
- Angular`Clipboard` API (disponible en CDK)

**Rutas**: No se modifican rutas