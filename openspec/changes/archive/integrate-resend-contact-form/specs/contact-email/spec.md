# contact-email Specification

## Purpose
Infraestructura de envío de email vía Resend para el formulario de contacto público. Cada envío dispara dos emails: uno al negocio y uno de confirmación al usuario.

## Requirements

### Requirement: Edge Function envía email al negocio
El sistema SHALL enviar un email a `CONTACT_EMAIL` (variable de entorno de la Edge Function) cada vez que se recibe un mensaje.

#### Scenario: Usuario envía formulario completo
- **GIVEN** nombre, email, teléfono y mensaje completos
- **WHEN** el formulario se envía correctamente
- **THEN** el negocio recibe email con asunto "Nuevo mensaje de contacto: {name}" y cuerpo con todos los datos

#### Scenario: Usuario no proporciona teléfono
- **GIVEN** `phone` vacío
- **WHEN** el formulario se envía
- **THEN** el email al negocio omite el campo teléfono sin error

### Requirement: Edge Function envía confirmación al usuario
El sistema SHALL enviar email de confirmación al remitente.

#### Scenario: Usuario envía formulario
- **GIVEN** email del remitente = `maria@example.com`
- **WHEN** envío exitoso
- **THEN** recibe email con asunto "Hemos recibido tu mensaje — CitasYa"

### Requirement: Resend REST API
El sistema SHALL usar `fetch` a `https://api.resend.com/emails` con `Authorization: Bearer {RESEND_API_KEY}`.

#### Scenario: API Key válida → email enviado con `{ id }` de Resend
#### Scenario: API Key inválida → status 500 con mensaje de error

### Requirement: SENDER_EMAIL como remitente
El sistema SHALL usar `Deno.env.get('SENDER_EMAIL')` como `from` en los emails.

### Requirement: ContactService persiste en contact_messages
El sistema SHALL insertar cada mensaje en `contact_messages` con `status: 'new'` ANTES de invocar la Edge Function.

#### Scenario: Inserción exitosa → luego se invoca Edge Function
#### Scenario: Inserción falla → error propagado, NO se invoca Edge Function

### Requirement: Fire-and-forget para email
Si la Edge Function falla después de persistir el mensaje, el registro YA está guardado. El error se loguea pero no revierte.

### Requirement: ContactComponent.onSubmit llama a ContactService
El `setTimeout` stub actual SHALL ser reemplazado por `ContactService.sendMessage()`.

#### Scenario: Éxito → loading=false, form reseteado, toast success
#### Scenario: Error → loading=false, toast error

### Requirement: Variables de entorno
La Edge Function requiere `RESEND_API_KEY`, `SENDER_EMAIL`, `CONTACT_EMAIL` configurados en Supabase Secrets.
