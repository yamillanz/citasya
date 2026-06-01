## Context

El componente `AppointmentsComponent` (panel de manager, ~670 líneas) implementa fetching imperativo de citas y empleados con un `loading` signal manual, `resetAndLoad()` que se invoca desde múltiples sitios (filtros, búsqueda, refresh, crear cita), y un `loadMore()` con paginación infinita.

El fetching manual tiene tres problemas concretos:

1. **Duplicación**: El mapeo filtros→API params se repite en `resetAndLoad()` y `loadMore()` (~35 líneas idénticas).
2. **Race conditions**: Si un filtro cambia mientras `loadMore()` está en vuelo, los datos stale del loadMore pueden quedar en `accumulatedAppointments` sin sobreescribirse.
3. **Estado desincronizado**: `loading`, `employees`, `accumulatedAppointments` se actualizan manualmente en try/finally, con riesgo de que un error en uno deje a los otros en estado inconsistente.

Angular 20.3.x introdujo `resource()` estable. Es una primitiva declarativa que:
- Re-carga automáticamente cuando sus dependencias reactivas (`params`) cambian.
- Maneja internamente `AbortSignal` para cancelar requests anteriores cuando los params cambian rápido.
- Expone `value()`, `isLoading()`, `error()` como signals.

El refactor migra a `resource()` para eliminar las ~120 líneas de fetching manual.

## Goals / Non-Goals

**Goals:**
- Eliminar fetching imperativo de `AppointmentsComponent` usando `resource()`.
- Crear `filterParams` computed como única fuente de verdad para API params.
- Prevenir race condition en `loadMore()` con `filterGeneration` counter.
- Mantener la interfaz observable (drawer, status, payment) intacta.
- Mantener todos los 65 tests pasando.

**Non-Goals:**
- Refactorizar otros componentes (e.g., `daily-close`, `weekly-report`).
- Cambiar la API de `AppointmentService.getByCompanyPaginated()`.
- Migrar a `httpResource()` (no aplica: el proyecto usa Supabase SDK, no `HttpClient`).
- Cambiar la lógica de paginación infinita o el IntersectionObserver.

## Decisions

### Decision 1: `resource()` con `params` computed en vez de `httpResource()`

**Opción elegida**: `resource()` con `loader` que llama a `AppointmentService.getByCompanyPaginated()` (que internamente usa Supabase SDK).

**Rationale**: El proyecto usa Supabase SDK (no `HttpClient`). `httpResource()` requiere `HttpClient`. `resource()` es genérico y funciona con cualquier Promise-returning loader. El `loader` envuelve la llamada al service.

**Alternativas consideradas**:
- `httpResource()`: descartada por incompatibilidad con Supabase SDK.
- Mantener fetching imperativo con `subscribe()`: descarta los beneficios de `resource()` y mantiene la duplicación.
- Crear un custom `Resource` wrapper: complejidad innecesaria, `resource()` ya provee lo necesario.

### Decision 2: `filterGeneration` counter para race condition en `loadMore()`

**Opción elegida**: Cada vez que `appointmentsResource` resuelve con nuevos datos (effect en constructor), incrementa `filterGeneration`. `loadMore()` captura el valor actual de `filterGeneration` antes del await, y después del await compara: si cambió, descarta el resultado.

**Rationale**: `resource()` solo cancela el request si el params signal cambia DURANTE el request del resource. Pero `loadMore()` hace su propio request manual (page > 0) que NO pasa por el resource. Sin un mecanismo de invalidación, los datos del loadMore pueden llegar después de un cambio de filtro y pisar los datos correctos.

**Alternativas consideradas**:
- `lastValueFrom(observable$)`: descarta el uso de Promises, pero el service devuelve Promise.
- Comparar params snapshot antes/después: frágil, requiere serializar params. `filterGeneration` es un counter atómico simple.
- Cancelar el request con `AbortController`: requiere pasar `AbortSignal` al service, mayor cambio.

### Decision 3: `showLoading` computed para unificar auth init + resource loading

**Opción elegida**: `showLoading = computed(() => !this.companyId() || this.appointmentsResource.isLoading())`.

**Rationale**: Mientras `authService.getCurrentUser()` está en vuelo, `companyId()` es `null` y el resource está en idle (`isLoading()` retorna `false`). Sin este computed, el template mostraría el empty state en vez del spinner durante ese breve momento.

**Alternativas consideradas**:
- `appointmentsResource.isLoading()` solo: causa flash de "empty state" durante auth init.
- Un signal `authReady` separado: añade un signal más sin beneficio sobre el computed.

### Decision 4: `debouncedSearchQuery` separado de `searchQuery`

**Opción elegida**: Mantener `searchQuery` para el valor inmediato del input (UX responsive) y `debouncedSearchQuery` para el valor que va a la API (con 300ms debounce).

**Rationale**: El usuario espera ver el texto en el input al instante, pero las llamadas a la API solo deben dispararse 300ms después de dejar de tipear. `filterParams` usa `debouncedSearchQuery`, no `searchQuery`.

**Alternativas consideradas**:
- Usar un solo `searchQuery` con debounce: la UI no se siente responsive (el texto aparece 300ms tarde).
- Reactive Forms: mayor refactor, sin beneficio claro para un input de búsqueda.

## Risks / Trade-offs

**[R1] Loading flash en cold start**: Si `companyId()` tarda en resolverse y el resource ya empezó a cargar con `undefined`, podría haber un estado intermedio.
**Mitigation**: `filterParams` retorna `undefined` cuando `companyId` es null, lo que pone al resource en idle. `showLoading` cubre este caso con `!companyId()`.

**[R2] Effect se ejecuta en cada cambio de `appointmentsResource.value()`**: El effect de sync se ejecutará también en la primera carga (con `value()` undefined), pero el guard `if (result)` lo previene. El effect sobrescribe `accumulatedAppointments` cuando hay un nuevo resource value.
**Mitigation**: Verificado manualmente que el effect solo actúa cuando `result` es truthy. Tests cubren el comportamiento.

**[R3] Test mock no replica exactamente el comportamiento de `resource()`**: El mock usa signals simples (`resourceIsLoading`, `resourceError`) en vez de un `resource()` real.
**Mitigation**: El mock es una simplificación deliberada para tests unitarios. Los tests verifican comportamiento del componente (guards de loadMore, filterParams, etc.), no la integración con el resource real. Tests e2e (no incluidos) cubrirían la integración.

**[R4] Posible doble fetch al cambiar filtro durante load inicial**: Si el usuario cambia un filtro en los primeros 100ms de carga, `resource()` cancela el primero y arranca uno nuevo.
**Mitigation**: Es el comportamiento deseado. `AbortSignal` interno previene race conditions en el resource. El `filterGeneration` cubre el caso del `loadMore` manual.

## Migration Plan

**Estrategia**: Cutover limpio. El cambio se aplica en una sola PR/commit.

**Pasos**:
1. Fases 1-3 (aditivas): agregar `debouncedSearchQuery`, `filterGeneration`, `filterParams`, `showLoading`, `appointmentsResource`, `employeesResource`, y el effect de sync. Coexisten con código imperativo.
2. Fases 4-5 (destructivas): eliminar `loading`, `employees`, `resetAndLoad`, `loadInitialData`, `debouncedFilterChange`, `filterTimeout`. Actualizar métodos para usar resource API.
3. Fases 6-7 (template/styles): actualizar bindings y agregar error state.
4. Fase 8 (tests): actualizar mock.

**Rollback**: `git revert <commit>`. El cambio es interno, no afecta a otros componentes.

**Validación post-deploy**: 
- Build pasa (`ng build`).
- 65 tests pasan (`npx jest appointments.component.spec`).
- Smoke test manual: login como manager, navegar a `/bo/appointments`, cambiar filtros, hacer scroll, abrir drawer de pago, crear cita, refrescar.

## Open Questions

_Ninguna._ El refactor está completo y verificado.
