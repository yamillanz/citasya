## Why

El componente `booking-form` era un monolito de ~500 líneas que mezclaba lógica de selección de servicios, resumen, formulario de contacto y pantalla de éxito. Esto dificultaba el mantenimiento, testing y reutilización. La refactorización extrae cada paso en sub-componentes independientes para mejorar la separación de responsabilidades y facilitar pruebas unitarias.

## What Changes

- **Extract** `selection-step` component: service selection, employee selection, date/time picker
- **Extract** `summary-step` component: booking review with service list, duration, and price
- **Extract** `contact-form-step` component: client contact information form
- **Extract** `success-step` component: booking confirmation and next steps
- **Simplify** parent `booking-form` to an orchestrator managing step navigation and state
- **Add** comprehensive unit tests for each sub-component (66 tests total)
- **Preserve** all existing booking-form functionality and public API

## Capabilities

### New Capabilities
- `booking-form-architecture`: Component architecture with step-based sub-components, parent-child communication via signals and outputs, and step navigation orchestration

### Modified Capabilities
<!-- No existing spec requirements change - this is an internal refactoring -->

## Impact

- **Affected files**: `booking-form.component.ts/html/scss` (reduced from ~500 to ~100 lines), 4 new sub-component directories under `steps/`
- **Tests**: 66 new unit tests across 5 test files
- **No breaking changes**: Public API, routing, and booking behavior remain identical
- **Build**: Angular compilation and production build verified
