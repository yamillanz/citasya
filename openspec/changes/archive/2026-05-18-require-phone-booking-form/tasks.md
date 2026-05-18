## 1. Actualizar validación del formulario

- [x] 1.1 Agregar `Validators.required` a `client_phone` en `bookingForm` en `booking-form.component.ts`
- [x] 1.2 Eliminar `atLeastOneContactValidator()` del form group y remover la función exportada
- [x] 1.3 Actualizar `hasContactError` en `contact-form-step.component.ts` para que ya no sea necesario (remover o simplificar)

## 2. Actualizar template del contact form step

- [x] 2.1 Cambiar label de teléfono de "Teléfono" a "Teléfono *" en `contact-form-step.component.html`
- [x] 2.2 Actualizar subtítulo del header para remover "Ingresa al menos un teléfono o email"
- [x] 2.3 Remover el bloque `@if (hasContactError())` del template ya que no será necesario
- [x] 2.4 Verificar que el mensaje de error para teléfono requerido se muestra correctamente

## 3. Verificación

- [x] 3.1 Verificar que el formulario no se puede enviar sin teléfono
- [x] 3.2 Verificar que el mensaje "Este campo es requerido" aparece en teléfono vacío
- [x] 3.3 Verificar que el mensaje de 10 dígitos mínimo sigue funcionando
- [x] 3.4 Verificar que el build compila sin errores
