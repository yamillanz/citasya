# Spec: Email HTML Styling

## Requirement: HTML profesional para emails de citas

El sistema SHALL generar y enviar un campo `html` adicional en cada email transaccional de citas, con un diseño visual profesional, responsive y consistente con la marca HolaCitas.

### Scenario: Cita confirmada → email con estilo

- **GIVEN** una cita con estado `created`
- **WHEN** se invoca `send-appointment-email` con `event_type: 'created'`
- **THEN** el email incluye:
  - Header con fondo verde `#9DC183` y texto "CONFIRMADA"
  - Cuerpo con detalles estructurados en filas: Cliente, Empleado, Fecha, Hora
  - Lista de servicios con nombre, duración y precio
  - Sección de negocio con dirección y teléfono (si existen)
  - Footer con branding "HolaCitas - Gestión de citas simplificada"
  - Texto plano como fallback

### Scenario: Cita cancelada → email con estilo rojo

- **GIVEN** una cita con estado `cancelled`
- **WHEN** se invoca `send-appointment-email` con `event_type: 'cancelled'`
- **THEN** el header usa color rojo `#E74C3C` y texto "CANCELADA"
- **AND** el resto de la estructura es idéntica al escenario de confirmación

### Scenario: No-show → email con estilo naranja

- **GIVEN** una cita con estado `no_show`
- **WHEN** se invoca `send-appointment-email` con `event_type: 'no_show'`
- **THEN** el header usa color naranja `#F39C12` y texto "NO ASISTIÓ"

## Requirement: HTML profesional para emails de contacto

El sistema SHALL generar y enviar un campo `html` adicional en ambos emails del formulario de contacto (al negocio y al usuario).

### Scenario: Formulario de contacto → email al negocio con estilo

- **GIVEN** un envío del formulario de contacto
- **WHEN** se invoca `send-contact-email`
- **THEN** el email al negocio incluye:
  - Header verde con "Nuevo mensaje de contacto"
  - Detalles estructurados: Nombre, Email, Teléfono (si aplica)
  - Cuerpo del mensaje en un bloque destacado
  - Footer con branding

### Scenario: Formulario de contacto → confirmación al usuario con estilo

- **GIVEN** un envío del formulario de contacto
- **WHEN** se invoca `send-contact-email`
- **THEN** el email de confirmación al usuario incluye:
  - Header verde con "¡Gracias por contactarnos!"
  - Mensaje de agradecimiento personalizado con el nombre
  - Footer con branding

## Requirement: Compatibilidad email-safe

El HTML generado SHALL:
- Usar tablas (`<table>`) para layout, no flexbox/grid
- Usar estilos inline en atributos `style`
- Incluir `role="presentation"` en tablas de layout
- Usar un max-width de 520px para legibilidad en todos los clientes
- Incluir ambos campos `text` y `html` en la petición a Resend
