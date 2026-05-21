# Design: email-html-styling

## Overview

Aplicar un sistema de diseño consistente a todos los emails transaccionales del sistema mediante HTML inline, compatible con la mayoría de clientes de email.

## Design Decisions

### Decision: HTML inline con tablas (email-safe)

**Chose** Generar HTML con estilos inline dentro de `<table>` tags, sin clases CSS externas.
**Over** Plantillas HTML separadas o frameworks de email.
**Because** Las Edge Functions de Supabase ejecutan código Deno; mantener todo autocontenido en el archivo `index.ts` evita dependencias adicionales y problemas de carga de archivos externos. Los estilos inline tienen el mejor soporte en clientes de email.

### Decision: Sistema de colores según estado de cita

**Chose** Un color distintivo en el header del email según el tipo de evento.
**Over** Un único color para todos los emails.
**Because** Permite identificación visual inmediata: verde para confirmaciones, rojo para cancelaciones, naranja para no-show.

| Evento | Color | Hex |
|--------|-------|-----|
| created | Verde Salvia | `#9DC183` |
| cancelled | Rojo | `#E74C3C` |
| no_show | Naranja | `#F39C12` |

### Decision: Retener texto plano como fallback

**Chose** Enviar ambos campos `text` y `html` en cada petición a Resend.
**Over** Solo enviar `html`.
**Because** Resend recomienda enviar ambos para máxima compatibilidad con clientes de email que no renderizan HTML o que tienen preferencia por texto plano.

## Component Design

### Email Template Structure

Todos los emails siguen la misma estructura base:

```
┌─ Outer Table (background #FAF8F5) ─┐
│ ┌─ Inner Table (max-width 520px) ─┐│
│ │ Header: colored bar + title     ││
│ │ Body: details grid               ││
│ │ Services list                    ││
│ │ Company info (optional)          ││
│ │ Footer: HolaCitas branding       ││
│ └──────────────────────────────────┘│
└─────────────────────────────────────┘
```

### Typography & Spacing

- **Font stack**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
- **Header title**: 22px, weight 700, white, letter-spacing 0.5px
- **Section labels**: 12px, uppercase, letter-spacing 0.5px, color `#5D6D7E`
- **Values**: 15px, weight 600, color `#2C3E50`
- **Padding**: 28px body, 24px header
- **Border radius**: 12px container, 8px inner cards

## Files

| File | Action | Description |
|------|--------|-------------|
| `backend/send-appointment-email/index.ts` | modify | Agregar `buildEmailHtml()`, actualizar `sendEmail()` para incluir `html`, actualizar builders de cliente/empleado/manager para retornar `html` |
| `backend/send-contact-email/index.ts` | modify | Agregar `buildContactEmailHtml()` y `buildConfirmationEmailHtml()`, actualizar ambos envíos para incluir `html` |
