# Tasks: email-html-styling

## Task List

- [x] **1.1** Crear función `buildEmailHtml()` en `send-appointment-email/index.ts` con template base responsive
- [x] **1.2** Crear función `buildEmailText()` (refactor del texto plano actual) para separar lógica de HTML y texto
- [x] **1.3** Agregar mapa de colores `STATUS_COLORS` según tipo de evento
- [x] **1.4** Actualizar `buildClientEmail()` para retornar `{ subject, text, html }`
- [x] **1.5** Actualizar `buildEmployeeEmail()` para retornar `{ subject, text, html }`
- [x] **1.6** Actualizar `buildManagerEmail()` para retornar `{ subject, text, html }`
- [x] **1.7** Actualizar `sendEmail()` para aceptar parámetro `html` y enviarlo en el body a Resend
- [x] **1.8** Actualizar todas las llamadas a `sendEmail()` para pasar el campo `html`
- [x] **2.1** Crear función `buildContactEmailHtml()` en `send-contact-email/index.ts`
- [x] **2.2** Crear función `buildConfirmationEmailHtml()` en `send-contact-email/index.ts`
- [x] **2.3** Actualizar envío de email al negocio para incluir campo `html`
- [x] **2.4** Actualizar envío de confirmación al usuario para incluir campo `html`
- [x] **3.1** Re-deploy `send-appointment-email`
- [x] **3.2** Re-deploy `send-contact-email`
- [x] **3.3** Verificar visualmente en Gmail que los emails renderizan correctamente
