# Delta Specs: Catálogo Público de Servicios por Empleado

## ADDED Requirements

### REQ-CAT-001: Servicios visibles en tarjetas de empleado
La página `/c/:companySlug` **SHALL** mostrar, dentro de cada tarjeta de empleado, la lista de servicios que ese empleado ofrece (nombre, duración, precio).

**Scenario: Empresa con empleados y servicios**
- **Given** "Peluquería Juan" (slug: `peluqueria-juan`) tiene empleada "María García" que ofrece "Corte" ($15, 30min) y "Tinte" ($45, 90min)
- **And** empleado "Carlos López" ofrece "Afeitado" ($10, 20min)
- **When** un cliente visita `/c/peluqueria-juan`
- **Then** ve 2 tarjetas: "María García" (con "Corte" y "Tinte") y "Carlos López" (con "Afeitado")
- **And** cada servicio muestra nombre, duración (`X min`), y precio (`$X.XX` o `Gratuito`)
- **And** cada servicio es clickeable

### REQ-CAT-002: Navegación con servicio pre-seleccionado
Al hacer clic en un servicio, el sistema **SHALL** navegar a `/c/:companySlug/e/:employeeId?serviceId={id}` con el servicio pre-seleccionado en el calendario.

**Scenario: Cliente selecciona un servicio**
- **Given** el cliente ve "Corte" en la tarjeta de María
- **When** hace clic en "Corte"
- **Then** navega a `/c/peluqueria-juan/e/maria-id?serviceId=corte-id`
- **And** "Corte" aparece con checkbox marcado y el resumen de selección visible

### REQ-CAT-003: Pre-selección vía query param en calendario
`EmployeeCalendarComponent` **SHALL** leer `serviceId` de `ActivatedRoute.queryParamMap` y pre-seleccionarlo si es válido.

**Scenario: Calendario con serviceId válido**
- **Given** URL: `/c/peluqueria-juan/e/maria-id?serviceId=corte-id`
- **When** el componente termina de cargar servicios
- **Then** `selectedServiceIds` incluye `corte-id`
- **And** la UI refleja el checkbox marcado y resumen visible

**Scenario: Calendario sin query param (compatibilidad)**
- **Given** URL: `/c/peluqueria-juan/e/maria-id` (sin query params)
- **When** carga normalmente
- **Then** ningún servicio está pre-seleccionado (flujo existente sin cambios)

**Scenario: serviceId inválido**
- **Given** `?serviceId=id-que-no-existe` o `?serviceId=servicio-de-otro-empleado`
- **When** carga
- **Then** se ignora silenciosamente, sin error

### REQ-CAT-004: Visualización de servicio gratuito
Servicios con `price === null | undefined` **SHALL** mostrar `Gratuito` con estilo visual diferenciado.

**Scenario: Servicio sin precio**
- **Given** "Consulta" tiene `price: null`
- **When** se renderiza
- **Then** muestra "Gratuito" en `--color-text-muted` con estilo italic

### REQ-CAT-005: Empleado sin servicios
Si un empleado no tiene servicios, **SHALL** mostrar "Sin servicios asignados" y mantener el botón "Ver disponibilidad".

**Scenario: Empleado sin employee_services**
- **Given** empleado activo pero sin registros en `employee_services`
- **When** se renderiza su tarjeta
- **Then** muestra mensaje "Sin servicios asignados"
- **And** botón "Ver disponibilidad" visible como fallback

### REQ-CAT-006: Batch query eficiente
`ServiceService.getServicesForEmployees(employeeIds)` **SHALL** ejecutar exactamente 1 query Supabase usando `.in('employee_id', employeeIds)` y retornar `Record<string, Service[]>`.

**Scenario: 10 empleados**
- **When** `getServicesForEmployees([...10 ids])` se llama
- **Then** 1 query a `employee_services` con `.in()`
- **And** resultado agrupado por `employee_id`
- **And** solo servicios con `is_active = true`

## MODIFIED Requirements

### REQ-CAT-MOD-001: Layout de página de empresa
- **Previously**: Tarjetas con avatar, nombre, teléfono, botón "Ver disponibilidad"
- **Now**: Tarjetas incluyen lista de servicios. Título cambia a "Nuestros servicios". Botón "Ver disponibilidad" se conserva como fallback.
