## Context

El componente `booking-form` original era un monolito de ~500 líneas en un solo archivo `.ts` y ~500 líneas de SCSS. Contenía toda la lógica de: selección de servicios/empleado/fecha, resumen de reserva, formulario de contacto, y pantalla de éxito. El testing era difícil porque cada parte dependía del estado global del componente.

## Goals / Non-Goals

**Goals:**
- Extraer cada paso del wizard en un sub-componente independiente
- Reducir el componente padre a un orquestador de navegación (~100 líneas)
- Mantener compatibilidad total con la API pública y comportamiento existente
- Agregar tests unitarios para cada sub-componente

**Non-Goals:**
- Cambiar la lógica de negocio de booking
- Modificar el esquema de base de datos
- Cambiar la navegación o rutas

## Decisions

### Decision 1: Signal-based inputs/outputs
Cada sub-componente recibe datos vía `input()` signals y emite eventos vía `output()`. Esto permite reactividad nativa sin `OnChanges` lifecycle hooks.

**Alternativa considerada**: Usar `@Input()`/`@Output()` decoradores — descartado porque el proyecto usa Angular 20 con signal-based inputs como estándar.

### Decision 2: Parent owns booking state
El padre mantiene el estado completo de la reserva (`bookingData` signal). Los hijos son stateless respecto a la reserva — solo emiten cambios al padre.

**Alternativa considerada**: Servicio compartido con signals — descartado porque añade complejidad innecesaria para un wizard de un solo flujo.

### Decision 3: External template and styles
Todos los sub-componentes usan `templateUrl` y `styleUrl` externos (no inline).

**Rationale**: Los templates superan 25 líneas y los SCSS superan 6 líneas, siguiendo las convenciones del proyecto.

### Decision 4: ChangeDetectionStrategy.OnPush
Todos los componentes usan `OnPush` con signals para detección de cambios óptima.

## Risks / Trade-offs

- **[Risk]** View Encapsulation puede bloquear estilos del padre a hijos → **Mitigation**: Cada hijo define sus propios estilos de `.step-card` y `.card-header`
- **[Trade-off]** Más archivos que mantener (5 componentes vs 1) → **Benefit**: Tests más fáciles, reutilización potencial, menor complejidad por archivo
- **[Risk]** Props drilling si el wizard crece → **Mitigation**: Si llega a >6 pasos, considerar un servicio de estado compartido
