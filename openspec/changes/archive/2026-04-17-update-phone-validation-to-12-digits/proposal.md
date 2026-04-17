# Proposal: Actualizar validación de teléfono de 10 a 12 dígitos

## ¿Por qué?

En el formulario de booking (reserva de citas) para clientes, el campo de teléfono actualmente valida un mínimo de 10 dígitos. Necesitamos aumentar esta validación a 12 dígitos para dar soporte a más formatos de téléphone internacionales o号码 locales que requieran más digitos.

## ¿Qué?

1. Actualizar el validador custom `phoneValidator` en `booking-form.component.ts` (línea ~29)
2. Actualizar la validación en el método `onSubmit` (línea ~269) donde valida "al menos 10 dígitos si no proporcionas email"
3. Actualizar el mensaje de error que muestra "al menos 10 dígitos"
4. Actualizar tests unitarios que referencian el valor 10

## ¿Quién?

- customers haciendo reservas de citas

## ¿Cuándo?

- Al momento de enviar el formulario de reserva