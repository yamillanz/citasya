## Why

Los emails transaccales de citas (confirmación, cancelación, no-show) y los emails del formulario de contacto se enviaban solo en texto plano con sintaxis Markdown (`**negrita**`). Los clientes de email no renderizan Markdown, por lo que los usuarios veían asteriscos literales y un formato poco profesional. Además, la falta de branding y estructura visual impactaba negativamente en la percepción del producto.

## What Changes

- **Modificar** `backend/send-appointment-email/index.ts`: agregar campo `html` a los emails con diseño profesional responsive usando tablas inline, paleta de colores HolaCitas y branding.
- **Modificar** `backend/send-contact-email/index.ts`: agregar campo `html` a ambos emails (negocio y confirmación al usuario) con el mismo sistema de diseño.

## Capabilities

### Updated Capabilities
- `appointment-email`: Los emails transaccionales ahora incluyen HTML con estilo profesional además del fallback de texto plano.
- `contact-email`: Los emails del formulario de contacto ahora incluyen HTML con estilo profesional.

## Impact

- **Archivos modificados**: 2 (`backend/send-appointment-email/index.ts`, `backend/send-contact-email/index.ts`)
- **Archivos nuevos**: 0
- **Dependencias nuevas**: Ninguna
