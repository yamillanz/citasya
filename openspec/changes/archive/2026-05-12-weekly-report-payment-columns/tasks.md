## 1. Model Update

- [x] 1.1 Agregar `is_paid: boolean` y `payment_date?: string` a `WeeklyDetailRow` en `weekly-report.model.ts`

## 2. Service Update

- [x] 2.1 Mapear `is_paid` y `payment_date` en el retorno de `getEmployeeDetail()` en `weekly-report.service.ts`

## 3. Template

- [x] 3.1 Agregar `<th>` "Pagado" y `<th>` "Fecha pago" en el header de la tabla
- [x] 3.2 Agregar `<td>` con badge verde / "—" para columna Pagado
- [x] 3.3 Agregar `<td>` con fecha formateada / "—" para columna Fecha pago
- [x] 3.4 Actualizar `colspan` del `emptymessage` de 8 a 10

## 4. Component Logic

- [x] 4.1 Agregar helper `formatPaymentDate(dateStr?: string): string` que retorna fecha corta o "—"
- [x] 4.2 Agregar helper `getPaidLabel(isPaid: boolean): string` que retorna "Pagado" o "—"
- [x] 4.3 Agregar columnas "Pagado" y "Fecha pago" al CSV export (`exportDetailCsv`)
- [x] 4.4 Actualizar arrays de headers y rows del CSV

## 5. Tests

- [x] 5.1 Verificar que `getPaidLabel` retorna "Sí"/"No"
- [x] 5.2 Verificar que `formatPaymentDate` formatea correctamente
- [x] 5.3 Verificar que el CSV incluye las nuevas columnas
