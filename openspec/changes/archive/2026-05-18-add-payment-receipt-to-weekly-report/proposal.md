# Proposal: add-payment-receipt-to-weekly-report

## Intent
Incluir el comprobante de pago del manager al empleado (`payment_receipt_url`) en el reporte semanal, específicamente en el diálogo de detalle de empleado, para que los managers y administradores puedan constatar visualmente los pagos realizados desde el mismo reporte.

## Scope

**In:**
- Agregar el campo `payment_receipt_url` al modelo `WeeklyDetailRow`
- Incluir `payment_receipt_url` en el mapping del servicio `WeeklyReportService.getEmployeeDetail()`
- Mostrar un enlace/ícono al comprobante de pago en la tabla de citas del diálogo de detalle de empleado
- Incluir la columna "Comprobante" en la exportación CSV del detalle
- Actualizar los specs del weekly-report para reflejar este nuevo comportamiento

**Out:**
- No se modifica el flujo de upload de imágenes (ya existe en el drawer de pago)
- No se añaden otros campos de pago (método, monto Bs, referencia) al reporte — solo el comprobante
- No se modifica la tabla de resumen semanal (solo el diálogo de detalle)
- No se modifica el componente de appointments (ya muestra el ícono)

## Approach
Cambio mínimo y quirúrgico: extender el modelo `WeeklyDetailRow`, pasar el dato en el servicio, agregar una columna en la tabla del diálogo con un link al comprobante, y actualizar el CSV. Se reutiliza el patrón visual existente de `.receipt-link` del componente `appointments`.
