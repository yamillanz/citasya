# Design: Catálogo Público de Servicios por Empleado

## Architecture Decisions

### 1. Batch query vs N+1 queries
**Chosen**: `ServiceService.getServicesForEmployees(employeeIds: string[])` — una sola query con `.in('employee_id', ids)`.

**Rejected**: Loop llamando `getByEmployee()` por cada empleado → N+1 problem.

**Implementation**:
```typescript
async getServicesForEmployees(employeeIds: string[]): Promise<Record<string, Service[]>> {
  if (employeeIds.length === 0) return {};
  const { data } = await this.supabase
    .from('employee_services')
    .select('employee_id, service:services(*)')
    .in('employee_id', employeeIds);
  const result: Record<string, Service[]> = {};
  for (const row of (data || [])) {
    const svc = row.service as Service | null;
    if (!svc || !svc.is_active) continue;
    (result[row.employee_id] ??= []).push(svc);
  }
  return result;
}
```

### 2. Query params (no nueva ruta)
**Chosen**: `?serviceId=X` en la ruta existente `/c/:slug/e/:id`.

**Rejected**: Nueva ruta como `/c/:slug/e/:id/s/:serviceId`. Innecesariamente complejo; el flujo actual ya usa query params.

### 3. Botón "Ver disponibilidad" como fallback
**Chosen**: Conservar el botón existente junto a los servicios. Si el empleado no tiene servicios, el botón es la única forma de navegar.

### 4. Pre-selección silenciosa (no error en serviceId inválido)
**Chosen**: Ignorar `serviceId` inválido sin error. Mejor UX.

## Data Flow

```
CompanyListComponent.ngOnInit()
  │
  ├─► companyService.getBySlug(slug)        → company signal
  ├─► userService.getEmployeesByCompany(id) → employees signal
  └─► serviceService.getServicesForEmployees(ids) → servicesByEmployee signal

Template: employee-card con bloque .employee-services dentro
  cada service-item → routerLink + queryParams { serviceId }

click en servicio → EmployeeCalendarComponent
  ngOnInit → lee queryParamMap('serviceId')
  si válido → selectedServiceIds.update(...)
```

## File Changes

| File | Action | Details |
|------|--------|---------|
| `core/services/service.service.ts` | MODIFY | +`getServicesForEmployees(employeeIds)` |
| `features/public/company-list/company-list.component.ts` | MODIFY | +inject(ServiceService), +signal, +fetch |
| `features/public/company-list/company-list.component.html` | MODIFY | +`.employee-services` block |
| `features/public/company-list/company-list.component.scss` | MODIFY | +estilos para service-item |
| `features/public/employee-calendar/employee-calendar.component.ts` | MODIFY | +lectura queryParam, +pre-selección |
| `features/public/company-list/company-list.component.spec.ts` | MODIFY | +tests de servicios |
| `features/public/employee-calendar/employee-calendar.component.spec.ts` | MODIFY | +test pre-selección |

## Layout Design Principles

| Principio | Aplicación |
|-----------|------------|
| Grid responsive | `grid-template-columns: repeat(auto-fit, minmax(340px, 1fr))` |
| Ritmo visual | `gap: 8px` entre service-items, `gap: 24px` entre cards |
| Jerarquía | Avatar+nombre = primario. Servicios = secundario |
| Hover | `background: var(--color-sage-pale)`, `translateX(4px)` |
| Precio | Alineado derecho, `font-weight: 600`. "Gratuito" italic muted |
| Mobile | Cards full-width, service-items stacked |
