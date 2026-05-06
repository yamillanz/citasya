## Why

El formulario de contacto público (`/contact`) tiene UI completa pero su `onSubmit()` es un stub con `setTimeout` — no persiste datos ni envía notificaciones. El proyecto carece de infraestructura de email. Integrar Resend resuelve ambos: activa el formulario real y sienta las bases para emails transaccionales futuros (citas).

## What Changes

- **Nueva Edge Function** `backend/send-contact-email/index.ts`: recibe datos del formulario, envía dos emails vía Resend REST API — uno al negocio (`CONTACT_EMAIL`) con los datos del remitente, y uno de confirmación al usuario.
- **Nuevo Servicio** `core/services/contact.service.ts`: persiste el mensaje en `contact_messages` e invoca la Edge Function.
- **Modificar** `contact.component.ts`: reemplazar `setTimeout` por `ContactService.sendMessage()`.
- **Variables de entorno Supabase**: `RESEND_API_KEY`, `SENDER_EMAIL`, `CONTACT_EMAIL`.

## Capabilities

### New Capabilities
- `contact-email`: Infraestructura de envío de email vía Resend para el formulario de contacto público. Envía email al negocio con datos del remitente + email de confirmación automática al usuario.

## Impact

- **Archivos nuevos**: 2 (`backend/send-contact-email/index.ts`, `core/services/contact.service.ts`)
- **Archivos modificados**: 1 (`contact.component.ts`)
- **Dependencias nuevas**: Ninguna (Resend via REST API con `fetch`, nativo Deno)
- **Variables de entorno**: 3 (`RESEND_API_KEY`, `SENDER_EMAIL`, `CONTACT_EMAIL`)
