# Proposal: Catálogo Público de Servicios por Empleado

## Intent
Transformar la página pública de empresa (`/c/:companySlug`) para que muestre los servicios que ofrece cada empleado con sus precios, permitiendo a los clientes elegir directamente un servicio y comenzar el booking con ese servicio pre-seleccionado, agilizando el flujo de reserva.

## Scope

**In**
- Rediseñar `CompanyListComponent` (`features/public/company-list/`) para mostrar tarjetas de empleado con sus servicios listados dentro
- Cada servicio es un elemento clickeable que navega al `EmployeeCalendarComponent` con `?serviceId=X`
- Agregar `ServiceService.getServicesForEmployees(employeeIds: string[])` — batch query para eficiencia
- Soportar query param `serviceId` en `EmployeeCalendarComponent` para pre-selección
- Aplicar principios de layout (espaciado rítmico, jerarquía visual, responsive grid)
- Mantener compatibilidad con flujo existente (sin query param = sin pre-selección)

**Out**
- No se modifica el flujo de booking (`BookingFormComponent`, lógica de slots)
- No se crean nuevas rutas (misma URL `/c/:companySlug`)
- No se modifican modelos de BD, RLS policies, ni backoffice
- No se agregan categorías de servicios (no existen en el modelo)

## Approach
1. **Service layer**: `getServicesForEmployees()` batch query → `Record<string, Service[]>`
2. **CompanyListComponent**: fetch employees + servicios en paralelo, renderizar services dentro de cada card
3. **EmployeeCalendarComponent**: leer `serviceId` query param, pre-seleccionar tras carga
4. **Estilos**: grid `auto-fit`, servicio-items con hover, precio alineado derecho, "Gratuito" estilizado
