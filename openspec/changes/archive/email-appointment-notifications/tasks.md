# Tasks: email-appointment-notifications

## Phase 1: Edge Function send-appointment-email
- [ ] 1.1 Crear `backend/send-appointment-email/index.ts`
- [ ] 1.2 Consultar appointment con joins (company, employee, services)
- [ ] 1.3 Consultar managers de la company
- [ ] 1.4 Construir lista de destinatarios según event_type
- [ ] 1.5 Construir email markdown con datos de la cita
- [ ] 1.6 Incluir link de cancelación en email de confirmación
- [ ] 1.7 Enviar emails via Resend REST API

## Phase 2: cancellation_token
- [ ] 2.1 Generar cancellation_token en AppointmentService.create()

## Phase 3: EmailNotificationService
- [ ] 3.1 Crear modelo email-notification.model.ts
- [ ] 3.2 Crear servicio email-notification.service.ts

## Phase 4: Integración en puntos de disparo
- [ ] 4.1 booking-form: notify(id, 'created') tras crear cita
- [ ] 4.2 employee-calendar: notify(id, 'cancelled') tras cancelar
- [ ] 4.3 manager-appointments: notify(id, 'cancelled'|'no_show')
- [ ] 4.4 daily-close.facade: exponer ID para notificación
