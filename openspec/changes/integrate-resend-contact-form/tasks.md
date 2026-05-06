# Tasks: integrate-resend-contact-form

## Pre-requisitos Manuales

- [x] **PR-1**: Verificar `negociosyelp@gmail.com` como destinatario en Resend Dashboard
- [x] **PR-2**: Configurar secrets en Supabase Dashboard: `RESEND_API_KEY`, `SENDER_EMAIL`, `CONTACT_EMAIL`

## Phase 1: Edge Function send-contact-email

- [x] 1.1 Crear `backend/send-contact-email/index.ts` con estructura `Deno.serve()`
- [x] 1.2 Implementar CORS headers (mismo patrón que `backend/create-user/index.ts`)
- [x] 1.3 Leer `RESEND_API_KEY`, `SENDER_EMAIL`, `CONTACT_EMAIL` de `Deno.env.get()`
- [x] 1.4 Validar body: `name`, `email`, `message` requeridos; `phone` opcional
- [x] 1.5 Construir y enviar email al negocio: to=`CONTACT_EMAIL`, subject=`"Nuevo mensaje de contacto: {name}"`
- [x] 1.6 Construir y enviar email de confirmación al usuario: to=`{email}`, subject=`"Hemos recibido tu mensaje — CitasYa"`
- [x] 1.7 Ambos envíos via `fetch('https://api.resend.com/emails', ...)`
- [x] 1.8 Manejo de errores: si un email falla, intentar el otro igualmente

## Phase 2: Contact Service

- [x] 2.1 Crear `app-web/src/app/core/services/contact.service.ts`
- [x] 2.2 Método `sendMessage(data)`: insertar en `contact_messages` → invocar `send-contact-email`
- [x] 2.3 Fire-and-forget: si Edge Function falla, loguear pero NO lanzar error

## Phase 3: Conectar Formulario

- [x] 3.1 Modificar `contact.component.ts`: inyectar ContactService + MessageService
- [x] 3.2 Reemplazar `setTimeout` stub en `onSubmit()` por `this.contactService.sendMessage()`
- [x] 3.3 Añadir toast de éxito/error con PrimeNG MessageService
- [x] 3.4 Añadir `<p-toast />` al template HTML si no existe

## Phase 4: Verificación

- [x] 4.1 Servir Edge Function localmente: `supabase functions serve send-contact-email --no-verify-jwt`
- [x] 4.2 Probar con curl
- [x] 4.3 Probar formulario en navegador → verificar ambos emails
- [x] 4.4 Verificar inserción en `contact_messages`
- [x] 4.5 Desplegar: `supabase functions deploy send-contact-email`
