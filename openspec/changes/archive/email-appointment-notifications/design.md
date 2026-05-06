# Design: email-appointment-notifications

## Architecture Decisions

### Decision: Edge Function separada para citas
**Chose** `send-appointment-email` (SRP)
**Over** Reutilizar `send-contact-email`
**Because** Lógica radicalmente distinta: consulta DB, múltiples destinatarios dinámicos, templates por tipo de evento. SRP.

### Decision: Edge Function consulta Supabase
**Chose** La Edge Function usa service_role para obtener datos completos de la cita (joins con company, employee, services, managers)
**Over** Pasar todos los datos desde el frontend
**Because** Menos datos en tránsito, una sola fuente de verdad, evita desincronización.

### Decision: Lista de managers obtenida desde la Edge Function
**Chose** Consultar `profiles` WHERE company_id = X AND role = 'manager'
**Over** Pasar lista desde el frontend
**Because** Centralizado, siempre actualizado.

## Data Flow

```
Trigger point (booking-form/calendar/etc.)
  │
  ▼
EmailNotificationService.notify(appointmentId, eventType)
  │
  └── supabase.functions.invoke('send-appointment-email', { body: { appointment_id, event_type } })

            │
            ▼
Edge Function: send-appointment-email
  │
  ├── 1. Fetch appointment + employee + company + services
  ├── 2. Fetch managers of company
  ├── 3. Build recipient list per event_type
  ├── 4. For each recipient: send email via Resend
  └── 5. Return { success, responses }
```

## Destinatarios por evento

| Evento | Cliente | Empleado | Manager(s) |
|--------|:-------:|:--------:|:----------:|
| created | ✅ | ✅ | ✅ |
| cancelled | ✅ | ✅ | ✅ |
| no_show | ❌ | ✅ | ❌ |

## File Changes

| File | Action |
|------|--------|
| `backend/send-appointment-email/index.ts` | **new** |
| `core/models/email-notification.model.ts` | **new** |
| `core/services/email-notification.service.ts` | **new** |
| `core/services/appointment.service.ts` | **modified** (cancellation_token) |
| `features/public/booking-form/booking-form.component.ts` | **modified** |
| `features/backoffice/employee/calendar/employee-calendar.component.ts` | **modified** |
| `features/backoffice/manager/appointments/appointments.component.ts` | **modified** |
| `features/backoffice/manager/daily-close/daily-close.facade.ts` | **modified** |
