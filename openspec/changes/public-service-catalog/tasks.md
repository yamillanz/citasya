# Tasks: Catálogo Público de Servicios por Empleado

## Phase 1: Service Layer — Batch Query

- [x] 1.1 Agregar `getServicesForEmployees(employeeIds: string[])` en `ServiceService`
  - Archivo: `app-web/src/app/core/services/service.service.ts`
  - Query: `supabase.from('employee_services').select('employee_id, service:services(*)').in('employee_id', ids)`
  - Retorna: `Record<string, Service[]>` agrupado, filtrando `is_active: true`
  - Edge: `employeeIds` vacío → `{}`

## Phase 2: CompanyListComponent — Rediseño

- [x] 2.1 Modificar TypeScript — agregar ServiceService, signal servicesByEmployee, fetch batch
- [x] 2.2 Modificar template HTML — títulos + bloque de servicios dentro de cada card
- [x] 2.3 Modificar estilos SCSS — .employee-services, .service-item, .service-price.free, hover, responsive

## Phase 3: EmployeeCalendarComponent — Query Param

- [x] 3.1 Leer `serviceId` query param y pre-seleccionar servicio si es válido

## Phase 4: Testing

- [x] 4.1 Actualizar tests de CompanyListComponent
- [x] 4.2 Actualizar tests de EmployeeCalendarComponent

## Phase 5: Verificación

- [ ] 5.1 Verificación visual en navegador
- [ ] 5.2 Verificación de regresión (flujo sin query param intacto)
