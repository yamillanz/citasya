## Why

Tras integrar Resend en la Etapa 1 (formulario de contacto), el sistema ahora puede enviar emails transaccionales. Los eventos del ciclo de vida de citas (agendada, cancelada, no-show) deben notificarse por email a clientes, empleados y managers para reducir inasistencias y mejorar la comunicación.

## What Changes

- **Nueva Edge Function** `backend/send-appointment-email/index.ts`: recibe `{ appointment_id, event_type }`, consulta los datos completos de la cita (company, employee, services), construye la lista de destinatarios según el tipo de evento, y envía emails via Resend.
- **Nuevo Modelo** `core/models/email-notification.model.ts`: tipos `EmailEventType`.
- **Nuevo Servicio** `core/services/email-notification.service.ts`: invoca la Edge Function en modo fire-and-forget.
- **Modificar** `AppointmentService.create()`: generar `cancellation_token` con `crypto.randomUUID()`.
- **Modificar** 4 puntos de disparo: booking-form, employee-calendar, manager-appointments, daily-close.

## Capabilities

### New Capabilities
- `appointment-email`: Envío de emails transaccionales para eventos del ciclo de vida de citas. Notifica a cliente, empleado y manager según el tipo de evento.

## Impact

- **Archivos nuevos**: 3 (`backend/send-appointment-email/index.ts`, `email-notification.model.ts`, `email-notification.service.ts`)
- **Archivos modificados**: 5 (`appointment.service.ts`, `booking-form.component.ts`, `employee-calendar.component.ts`, `appointments.component.ts`, `daily-close.facade.ts`)
- **Dependencias nuevas**: Ninguna
