# appointment-email Specification

## Purpose
Envía emails transaccionales para eventos del ciclo de vida de citas: agendada, cancelada y no-show. Notifica a los destinatarios relevantes según el tipo de evento.

## Requirements

### Requirement: Email de cita agendada
El sistema SHALL enviar email de confirmación a cliente, empleado y managers de la empresa cuando se agenda una cita.

#### Scenario: Cliente agenda con email
- **GIVEN** cita creada con client_email="maria@test.com"
- **WHEN** se invoca con event_type="created"
- **THEN** maria@test.com, el empleado, y todos los managers de la company reciben email con asunto "CONFIRMADA: Maria"

#### Scenario: Email incluye link de cancelación
- **GIVEN** la cita tiene cancellation_token
- **WHEN** se envía email de confirmación
- **THEN** el email al cliente incluye link de cancelación

### Requirement: Email de cita cancelada
El sistema SHALL enviar email de cancelación a cliente, empleado y managers.

#### Scenario: Manager cancela cita
- **WHEN** event_type="cancelled"
- **THEN** cliente, empleado y managers reciben email con asunto "CANCELADA: {nombre}"

### Requirement: Email de no-show
El sistema SHALL enviar email SOLO al empleado cuando se marca no-show.

#### Scenario: Cita marcada como no-show
- **WHEN** event_type="no_show"
- **THEN** solo el empleado recibe email con asunto "NO ASISTIÓ: {nombre}"

### Requirement: Sin client_email se omite cliente
Si la cita no tiene client_email, el email al cliente se omite silenciosamente. Los demás destinatarios se notifican normalmente.

### Requirement: Asunto con formato ESTADO: NOMBRE
El asunto SHALL ser "{ESTADO}: {NOMBRE_CLIENTE}" donde ESTADO es CONFIRMADA, CANCELADA, o NO ASISTIÓ.

### Requirement: Contenido del email en texto plano
El cuerpo SHALL incluir: nombre del negocio, empleado, fecha, hora, servicios, y dirección/teléfono del negocio si existen.

### Requirement: Fire-and-forget desde frontend
El EmailNotificationService SHALL invocar la Edge Function sin bloquear la operación de la cita. Errores se loguean sin propagarse.

### Requirement: cancellation_token generado al crear cita
AppointmentService.create() SHALL generar un cancellation_token UUID v4 antes del INSERT.
