# Design: integrate-resend-contact-form

## Architecture Decisions

### Decision: REST API de Resend vía fetch en Deno
**Chose** `fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: 'Bearer ' + key } })`
**Over** SDK `import { Resend } from 'resend'`
**Because** Documentado oficialmente para Supabase Edge Functions con Deno. Cero dependencias externas. La guía oficial de Resend + Supabase usa este patrón.

### Decision: Edge Function específica para contacto
**Chose** `send-contact-email` con lógica de dominio (construye asunto, cuerpo, destinatarios)
**Over** Edge Function genérica `send-email`
**Because** SRP: una función por dominio. Etapa 2 tendrá `send-appointment-email`.

### Decision: Dos emails por envío
**Chose** Email al negocio + email de confirmación al usuario
**Because** El usuario lo requiere. Mejora UX: el remitente sabe que su mensaje fue recibido.

### Decision: Fire-and-forget desde el frontend
**Chose** Insertar en DB primero, luego invocar Edge Function. Si email falla, mensaje ya persistido.
**Because** El email es notificación complementaria. Revertir DB por fallo de email perdería el mensaje.

### Decision: CORS headers siguiendo patrón existente
**Chose** Mismos headers que `backend/create-user/index.ts`
**Because** Consistencia con la Edge Function existente.

## Data Flow

```
ContactComponent.onSubmit()
  │
  ▼
ContactService.sendMessage({ name, email, phone?, message })
  │
  ├── 1. INSERT INTO contact_messages (RLS: público)
  │
  └── 2. supabase.functions.invoke('send-contact-email', { body })

            │
            ▼
Edge Function: send-contact-email (Deno)
  │
  ├── Email #1 → CONTACT_EMAIL (negocio)
  │     Subject: "Nuevo mensaje de contacto: {name}"
  │     Body: name, email, phone?, message
  │
  └── Email #2 → {email} (usuario)
        Subject: "Hemos recibido tu mensaje — CitasYa"
        Body: Agradecimiento

Ambos vía: POST https://api.resend.com/emails
  Authorization: Bearer {RESEND_API_KEY}
  Content-Type: application/json
  { from, to, subject, text }
```

## File Changes

| File | Action | Purpose |
|------|--------|---------|
| `backend/send-contact-email/index.ts` | **new** | Edge Function Deno: envía 2 emails via Resend REST API |
| `app-web/src/app/core/services/contact.service.ts` | **new** | Inserta en contact_messages + invoca Edge Function |
| `app-web/src/app/features/landing/contact/contact.component.ts` | **modified** | Reemplazar setTimeout stub por ContactService |

## Environment Variables (Supabase Secrets)

| Variable | Value |
|----------|-------|
| `RESEND_API_KEY` | `re_xxxxxxxxxxxxx` (obtener en resend.com/api-keys) |
| `SENDER_EMAIL` | `CitasYa <onboarding@resend.dev>` |
| `CONTACT_EMAIL` | `negociosyelp@gmail.com` |
