## Why

Actualmente, cuando un manager completa una cita, registra el monto cobrado pero no hay forma de marcar si ese monto ya fue entregado/pagado al empleado. Los pagos se hacen semanalmente y el manager necesita llevar control de qué citas ya pagó y cuáles no, desde el mismo lugar donde gestiona las citas.

## What Changes

- Agregar 4 campos nuevos a la tabla `appointments`: `is_paid` (boolean), `payment_method` (text), `payment_reference` (text), `payment_date` (timestamptz)
- Agregar tipo `PaymentMethod` y campos de pago al modelo `Appointment`
- Agregar método `markAsPaid()` en `AppointmentService`
- Mostrar badge "Pagado" en citas completadas ya pagadas en el listado (`/bo/appointments`)
- Mostrar botón "Registrar pago" en citas completadas no pagadas en el listado
- Nuevo drawer de pago con: método de pago (requerido), n° referencia (opcional), monto Bs (precargado de `amount_in_bs`), fecha/hora automática

## Capabilities

### New Capabilities
- `appointment-payment`: Registro de pago de citas completadas. Permite al manager marcar una cita como pagada con método de pago, referencia, monto en Bs y timestamp automático.

### Modified Capabilities
- `appointment-management`: Se agregan campos de pago al modelo Appointment y nueva acción "Registrar pago" en el drawer de cambio de estado del listado de citas.

## Impact

- **DB**: Nueva migración para agregar columnas `is_paid`, `payment_method`, `payment_reference`, `payment_date` a la tabla `appointments`
- **Model**: `appointment.model.ts` — nuevos campos y tipo `PaymentMethod`
- **Service**: `appointment.service.ts` — nuevo método `markAsPaid()`
- **Component**: `appointments.component.ts` — señales de pago, `openPaymentDrawer()`, `confirmPayment()`, helpers extendidos
- **Template**: `appointments.component.html` — badge/botón en card, rama `paid` en drawer
- **Tests**: `appointments.component.spec.ts` — tests de renderizado condicional, drawer y llamadas al servicio
