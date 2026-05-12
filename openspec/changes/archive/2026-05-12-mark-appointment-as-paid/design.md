## Context

El proyecto CitasYa tiene un listado de citas (`/bo/appointments`) donde los managers gestionan el ciclo de vida de las citas: las completan, cancelan o marcan como no asistidas. Al completar una cita, se registran montos (USD, tasa, Bs) y observaciones.

Actualmente no existe ningún concepto de "pago" — no hay forma de saber si el monto cobrado ya fue entregado al empleado. Como los pagos se hacen semanalmente, el manager necesita una forma rápida de marcar qué citas ya pagó, idealmente desde el mismo flujo de gestión de citas.

## Goals / Non-Goals

**Goals:**
- Permitir al manager marcar una cita completada como pagada con método de pago, referencia y monto en Bs
- Mostrar visualmente en el listado qué citas están pagadas y cuáles no
- Reutilizar el patrón existente de drawer para cambios de estado

**Non-Goals:**
- No se crea una nueva página/ruta de pagos (futuro si escala)
- No se modifica el reporte semanal ni el cierre diario
- No se agrega UI de pago en la vista de calendario
- No se implementa edición de pagos ni historial de pagos

## Decisions

### 1. Colocación: Listado de Citas (`/bo/appointments`)

Se eligió el listado de citas sobre el Cierre Diario (mezclaría responsabilidades) y sobre una nueva página de Pagos (over-engineering para esta fase). El listado es el lugar natural donde el manager busca citas y ya realiza acciones sobre ellas.

### 2. Flag `is_paid` vs nuevo status

Se usa un flag booleano independiente del status. "Pagado" no es un estado de la cita (pending → completed → cancelled → no_show), es una propiedad adicional. Una cita completada puede estar pagada o no. Esto permite que el status y el pago evolucionen independientemente.

### 3. Campos de pago en la tabla `appointments`

Se agregan los campos directamente en `appointments` en vez de crear una tabla separada `payments`. Para la fase actual (un flag + 3 campos), una tabla separada añadiría complejidad innecesaria (join, migración de datos, relación 1:1). Si en el futuro se necesita historial de pagos por cita, se migra.

### 4. Método `markAsPaid` separado de `updateStatus`

Se crea un nuevo método en `AppointmentService` en lugar de extender `updateStatus`. `updateStatus` cambia el `status` de la cita; `markAsPaid` solo toca campos de pago. Métodos con responsabilidades distintas previenen bugs (ej: accidentalmente cambiar el status al marcar como pagado).

### 5. Reutilización del drawer existente

Se extiende `statusAction` para incluir `'paid'` y se agrega una rama `@else if` en el drawer existente. Esto evita duplicar el componente drawer completo (header, footer, lógica de cierre) y sigue el mismo patrón que ya usan `completed`, `cancelled`, `no_show`.

### 6. Sin UI de pago en vista calendario

La vista de calendario es compacta y los items no tienen espacio para botones adicionales. El manager que necesita registrar pagos usa la vista de Lista. Esto mantiene la vista de calendario enfocada en su propósito (vista temporal).

## Risks / Trade-offs

- **[Riesgo] Campos de pago en `appointments` en vez de tabla separada**: Si en el futuro se necesita registrar múltiples pagos por cita o un historial completo, habrá que migrar. → **Mitigación**: Los 4 campos son fáciles de migrar a una tabla separada. La decisión actual no bloquea esa evolución.
- **[Riesgo] Drawer con 4 acciones**: El drawer crece en complejidad con cada nueva acción. → **Mitigación**: Cada acción tiene una rama `@else if` independiente. Si se agrega una quinta acción, considerar refactorizar a componente separado.
- **[Trade-off] Bs amount es editable en el drawer**: El manager puede cambiar el monto respecto al `amount_in_bs` original. Esto es intencional (el monto real del pago puede diferir del registrado al completar), pero no se actualiza `amount_in_bs` retroactivamente.

## Migration Plan

1. Ejecutar migración SQL para agregar columnas (las columnas son nullable con default `false` para `is_paid`, sin impacto en registros existentes)
2. Desplegar código (nuevos campos en modelo, servicio, UI)
3. Los appointments existentes tendrán `is_paid = false` por defecto — el manager los irá marcando manualmente

## Open Questions

- Ninguna pendiente
