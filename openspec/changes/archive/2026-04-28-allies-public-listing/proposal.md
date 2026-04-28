## Why

Los clientes necesitan descubrir negocios registrados en la plataforma para elegir dónde agendar citas. Actualmente no hay un directorio público; solo se accede a un negocio si se conoce su URL exacta (`/c/:slug`). Esto limita el descubrimiento y reduce el valor para los dueños de negocios.

## What Changes

- Nueva página pública `/aliados` con listado de empresas activas
- Grid de cards mostrando logo, nombre, dirección, teléfono y servicios inline por empresa
- Búsqueda por nombre con debounce (server-side filtering)
- Scroll infinito con lazy load de 10 en 10 mediante IntersectionObserver
- Nuevo enlace "Aliados" en el header del landing (al final del menú)
- Nuevo método `getActiveCompaniesPaginated(page, size, search)` en `CompanyService`
- Nuevo método `getServicesByCompanies(companyIds)` en `ServiceService`

## Capabilities

### New Capabilities
- `allies-public-listing`: Página pública con directorio de negocios activos, búsqueda por nombre, servicios inline por empresa y scroll infinito.

### Modified Capabilities
<!-- No se modifican capacidades existentes -->
<!-- (none) -->

## Impact

- **Nuevo**: `app-web/src/app/features/public/allies/` (carpeta completa)
- **Modificado**: `app-web/src/app/core/services/company.service.ts` (nuevo método)
- **Modificado**: `app-web/src/app/core/services/service.service.ts` (nuevo método)
- **Modificado**: `app-web/src/app/shared/components/landing-header/landing-header.component.ts` (+ link)
- **Modificado**: `app-web/src/app/shared/components/landing-header/landing-header.component.html` (+ menu item)
- **Modificado**: `app-web/src/app/app.routes.ts` (nueva ruta perezosa)
