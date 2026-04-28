## Context

Actualmente no existe un directorio público de empresas. Los clientes deben conocer la URL exacta (`/c/:slug`) para agendar. Esta feature agrega descubrimiento: `/aliados` muestra todas las empresas activas con búsqueda, servicios inline y navegación a la página de empresa existente.

## Goals / Non-Goals

**Goals:**
- Página pública `/aliados` con grid de empresas activas y servicios inline
- Búsqueda por nombre con debounce 300ms y filtrado server-side
- Scroll infinito con IntersectionObserver (10 por página)
- Enlace "Aliados" en el header del landing

**Non-Goals:**
- Filtros por categoría/ubicación (no existen en el modelo actual)
- Paginación tradicional con números (se usa scroll infinito en su lugar)
- Vista de detalle de empresa (ya existe en `/c/:companySlug`)
- SEO avanzado / SSR (la app es SPA con CSR)

## Decisions

### 1. Server-side pagination con Supabase `.range()`
**Decisión**: Usar `.range(start, end)` de Supabase para paginación server-side en vez de cargar todas y paginar en cliente.
**Alternativa**: Cargar todas las empresas y paginar en cliente.
**Razón**: Si hay cientos de empresas, cargar todas de golpe es ineficiente. `.range()` delega el slicing a Postgres.

### 2. `getServicesByCompanies` usa `services.company_id` directo
**Decisión**: Nuevo método batch que consulta `services` por `company_id` (no por tabla puente).
**Alternativa**: Reusar `getServicesForEmployees` que usa `employee_services`.
**Razón**: Los servicios se relacionan directo con `company_id` (no hay tabla puente empresa-servicio). Es una consulta más simple y directa.

### 3. IntersectionObserver para scroll infinito
**Decisión**: Elemento sentinel invisible al final del grid observado con `IntersectionObserver`.
**Alternativa**: Escuchar evento `scroll` del window con throttling. Usar librería como `ngx-infinite-scroll`.
**Razón**: `IntersectionObserver` es nativo del navegador, más performante que eventos scroll, y no requiere dependencia externa. Se implementa con `afterNextRender` + `effect()` para integrar con ciclo de vida Angular.

### 4. Debounce con `setTimeout` + `effect()`
**Decisión**: La búsqueda usa un signal `searchQuery` que un `effect()` observa. Dentro del effect se usa `setTimeout(300ms)` + `clearTimeout` para debounce.
**Alternativa**: Usar RxJS `debounceTime` con `Subject` o `toSignal`.
**Razón**: Consistencia con el resto del codebase que usa signals, no RxJS. Simple y sin dependencias extra.

### 5. Estructura de archivos
**Decisión**: Carpeta `features/public/allies/` con 3 archivos separados (`.ts`, `.html`, `.scss`).
**Alternativa**: Todo inline en el `.ts`.
**Razón**: El template será >25 líneas y los estilos >6 líneas, siguiendo la convención del proyecto.

## Risks / Trade-offs

- **[Riesgo] Scroll infinito + búsqueda**: Si el usuario busca algo, hace scroll, luego busca otra cosa — el estado de paginación debe resetearse correctamente. **Mitigación**: La búsqueda resetea `page=0` y los resultados reemplazan (no appendean).
- **[Riesgo] IntersectionObserver en SSR**: `IntersectionObserver` no existe en Node. **Mitigación**: Usar `afterNextRender()` para inicializarlo solo en browser.
- **[Riesgo] Performance con muchas empresas**: Si hay 1000+ empresas, 10 por página = 100 requests posibles de scroll. **Mitigación**: `hasMore` flag evita requests innecesarios. Si se vuelve problema, aumentar `pageSize` a 20.
- **[Trade-off] Sin caché de servicios**: Cada carga de página de empresas dispara `getServicesByCompanies`. Si el usuario visita `/aliados` frecuentemente, podría cachearse. Se omite por simplicidad inicial.

## Open Questions

- (Ninguna pendiente — todas las decisiones fueron validadas con el stakeholder)
