## Context

El componente `login.component` usa PrimeNG (`pInputText`, `p-password`, `p-checkbox`, `p-button`). Los labels en el template usan `for="email"` y `for="password"`, pero los componentes PrimeNG no siempre propagan el `id` al input nativo. El `p-password` en particular no tiene `id="password"`, rompiendo la asociación label-input. Además, el link "¿Olvidaste tu contraseña?" apunta a `href="#"` sin funcionalidad.

## Goals / Non-Goals

**Goals:**
- Fase 1: Arreglar accesibilidad del formulario (labels, autocomplete, required fields)
- Fase 1: Eliminar link roto de forgot password
- Fase 2: Reducir elementos decorativos de fondo
- Fase 2: Remover social proof genérico

**Non-Goals:**
- Implementar flujo real de recuperación de contraseña
- Cambiar el diseño visual del formulario principal (card, inputs, botón)
- Modificar la lógica de autenticación

## Decisions

**1. Usar `inputId` en PrimeNG en lugar de `id` nativo**
- PrimeNG components como `pInputText` y `p-password` requieren `inputId` para vincular correctamente el label. `id` solo afecta el wrapper, no el input nativo.

**2. Eliminar forgot-password en lugar de ocultar**
- `href="#"` es un anti-pattern. Ocultar con CSS o condicional no resuelve el problema de que la funcionalidad no existe. Mejor remover completamente hasta que se implemente.

**3. Required indicator con asterisco en label**
- Más escaneable que texto completo. Se usa el color de error (`var(--color-error)`) para coherencia visual. Se mantiene en el mismo `label` para no romper el flujo de lectura.

**4. Fase 2: Remover social proof y decoración excesiva**
- El social proof con iniciales genéricas es reconocible como falso. Los 5 elementos decorativos de fondo (2 blobs + grid + 2 shapes) son excesivos para una tarea de 2 campos.

## Risks / Trade-offs

- **[Risk]** Remover el social proof puede hacer la página sentirse "vacía".
  - **Mitigation**: El formulario + footer de registro ya proporcionan suficiente contenido. La página sigue teniendo el card con blur y animación de entrada.
- **[Risk]** Reducir decoración puede hacer que el login se sienta menos "premium".
  - **Mitigation**: Se mantiene la animación de entrada (`fadeInUp`) y el card con backdrop blur. La calidad percibida viene del pulido de interacción, no de la cantidad de elementos decorativos.

## Migration Plan

No se requiere migración. Cambios puramente de UI. Rollback: revertir los 3 archivos del componente login.
