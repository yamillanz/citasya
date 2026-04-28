## ADDED Requirements

### Requirement: CompanyService.getActiveCompaniesPaginated
El sistema SHALL proveer un método para obtener empresas activas de forma paginada con filtro opcional por nombre.

#### Scenario: Fetch first page with no search
- **WHEN** se llama `getActiveCompaniesPaginated(page=0, size=10, search='')`
- **THEN** retorna las primeras 10 empresas activas ordenadas por nombre
- **AND** un flag `hasMore` indica si existen más registros

#### Scenario: Fetch with search filter
- **WHEN** se llama `getActiveCompaniesPaginated(page=0, size=10, search='barber')`
- **THEN** retorna solo empresas cuyo nombre contiene "barber" (case-insensitive)
- **AND** respeta el filtro `is_active = true`

#### Scenario: No more results
- **WHEN** se pide una página más allá del total
- **THEN** retorna array vacío con `hasMore: false`

#### Scenario: Empty search returns no results
- **WHEN** no hay empresas que coincidan con el término de búsqueda
- **THEN** retorna array vacío con `hasMore: false`

### Requirement: ServiceService.getServicesByCompanies
El sistema SHALL proveer un método para obtener servicios de múltiples empresas en una sola consulta batch.

#### Scenario: Fetch services for multiple companies
- **WHEN** se llama `getServicesByCompanies(['comp-1', 'comp-2'])`
- **THEN** retorna `Record<string, Service[]>` agrupado por `company_id`
- **AND** solo servicios con `is_active: true`

#### Scenario: Empty company list
- **WHEN** se llama con array vacío
- **THEN** retorna `{}`

### Requirement: Página Aliados - Carga inicial
La página `/aliados` SHALL mostrar un grid de empresas activas con scroll infinito.

#### Scenario: Initial load
- **WHEN** el usuario navega a `/aliados`
- **THEN** se muestran 6 skeleton cards mientras carga
- **AND** al completar la carga se muestran las primeras 10 empresas en un grid de cards
- **AND** si hay más de 10, aparece un sentinel al final del grid para trigger de scroll

#### Scenario: No companies exist
- **WHEN** no hay empresas activas en la plataforma
- **THEN** se muestra estado vacío: "Aún no hay negocios registrados" con ilustración

#### Scenario: Load error
- **WHEN** falla la carga inicial
- **THEN** se muestra mensaje de error con botón "Reintentar"

### Requirement: Página Aliados - Card de empresa
Cada card en el grid SHALL mostrar información de la empresa y sus servicios.

#### Scenario: Card with full data
- **WHEN** se renderiza una card de empresa con logo, nombre, dirección, teléfono y servicios
- **THEN** la card muestra: logo (o inicial del nombre), nombre, dirección, teléfono, y los primeros servicios inline
- **AND** si la empresa tiene 0 servicios, no se muestra sección de servicios
- **AND** click en la card navega a `/c/:companySlug`

#### Scenario: Card with minimal data (sin address, phone, logo)
- **WHEN** empresa solo tiene nombre y slug
- **THEN** muestra inicial del nombre como avatar fallback, nombre, y servicios si existen

### Requirement: Página Aliados - Búsqueda por nombre
La página SHALL permitir filtrar empresas por nombre con debounce de 300ms.

#### Scenario: User types a search query
- **WHEN** el usuario escribe "Pelu" en el campo de búsqueda
- **AND** pasan 300ms sin escribir más
- **THEN** se resetea la paginación a página 0
- **AND** se muestran los resultados filtrados reemplazando el contenido actual
- **AND** el placeholder del input dice "Buscar negocio por nombre..."

#### Scenario: Search with no results
- **WHEN** la búsqueda no produce resultados
- **THEN** se muestra "No encontramos negocios para 'query'" con sugerencia de probar otro término

#### Scenario: Clear search
- **WHEN** el usuario borra el texto del input de búsqueda
- **THEN** se restaura el listado completo (página 0 sin filtro)

### Requirement: Página Aliados - Scroll infinito
La página SHALL cargar más empresas al hacer scroll hasta el final mediante IntersectionObserver.

#### Scenario: Scroll triggers next page
- **WHEN** el usuario hace scroll hasta el sentinel final
- **AND** `hasMore` es true
- **THEN** se muestra un spinner pequeño al final
- **AND** se cargan 10 empresas más, appendeándose al grid existente

#### Scenario: No more pages
- **WHEN** el usuario llega al final y `hasMore` es false
- **THEN** se muestra "Has visto todos los negocios disponibles"

#### Scenario: Search active prevents appending
- **WHEN** hay un término de búsqueda activo
- **AND** el usuario hace scroll
- **THEN** no se dispara carga adicional (solo aplica sin filtro)

### Requirement: Header del landing - Enlace Aliados
El header del landing SHALL incluir un enlace "Aliados" al final del menú de navegación.

#### Scenario: Desktop navigation
- **WHEN** el usuario ve el header en desktop (>=1024px)
- **THEN** "Aliados" aparece después de "Contacto" en la barra de navegación
- **AND** click navega a `/aliados`
- **AND** el link se resalta cuando la ruta actual es `/aliados`

#### Scenario: Mobile navigation
- **WHEN** el usuario abre el menú móvil
- **THEN** "Aliados" aparece después de "Contacto" en el drawer
