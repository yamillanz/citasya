## 1. Database Migration

- [x] 1.1 Crear migración SQL para agregar columnas `is_paid`, `payment_method`, `payment_reference`, `payment_date` a la tabla `appointments`
- [x] 1.2 Aplicar la migración en Supabase (creada en `supabase/migrations/20260512_add_payment_fields.sql`, se aplica al desplegar)

## 2. Model and Service Layer

- [x] 2.1 Agregar tipo `PaymentMethod` y campos de pago a la interfaz `Appointment` en `appointment.model.ts`
- [x] 2.2 Agregar método `markAsPaid()` en `AppointmentService` con payload: `payment_method`, `payment_reference?`, `payment_amount_bs?`, `payment_date` automático

## 3. Component Logic (appointments.component.ts)

- [x] 3.1 Agregar señales de pago: `paymentMethod`, `paymentReference`, `paymentAmountBs`, `saving`
- [x] 3.2 Agregar método `openPaymentDrawer(appointment)` que precarga `amount_in_bs` y abre el drawer con `statusAction = 'paid'`
- [x] 3.3 Extender helpers (`getDrawerTitle`, `getActionLabel`, `getActionSeverity`, `getStatusIcon`) con caso `'paid'`
- [x] 3.4 Extender `statusAction` type a `'completed' | 'cancelled' | 'no_show' | 'paid' | null`
- [x] 3.5 Agregar método `confirmPayment()` que llama a `markAsPaid`, actualiza señal local, muestra toast y cierra drawer
- [x] 3.6 Agregar manejo de estado `saving` (spinner en botón, deshabilitar cerrar) y manejo de errores (drawer abierto en error)

## 4. Template (appointments.component.html)

- [x] 4.1 Agregar badge "Pagado" (verde, check icon) en cards de citas completadas con `is_paid = true`
- [x] 4.2 Agregar botón "Registrar pago" (`pi-money-bill`, severity info, size small) en cards de citas completadas con `is_paid = false`
- [x] 4.3 Agregar rama `@else if (statusAction() === 'paid')` en el drawer con formulario de pago (p-select para método, pInputText para referencia, p-inputNumber para monto Bs, fecha estática)
- [x] 4.4 Agregar `[pDisabled]="statusAction() === 'paid' && !paymentMethod()"` en botón confirmar del footer
- [x] 4.5 Agregar loading spinner en botón confirmar cuando `saving()` es true

## 5. Styles

- [x] 5.1 Agregar estilos del badge "Pagado" en `appointments.component.scss`
- [x] 5.2 Agregar estilos del botón "Registrar pago" en `appointments.component.scss`
- [x] 5.3 Verificar si el formulario de pago en el drawer necesita overrides en `styles.scss` (por renderizado en body) — se agregó `.payment-date-info`

## 6. Tests

- [x] 6.1 Agregar test unitario para `markAsPaid` en `AppointmentService`: verifica payload y propagación de errores
- [x] 6.2 Agregar tests de renderizado condicional (via mock factory)
- [x] 6.3 Agregar test de apertura del drawer de pago
- [x] 6.4 Agregar test de precarga de monto Bs
- [x] 6.5 Agregar test de botón confirmar sin método de pago (no llama a markAsPaid)
- [x] 6.6 Agregar test de `confirmPayment`: verifica llamada con datos correctos
- [x] 6.7 Agregar test de `closeDrawer` resetea señales de pago
