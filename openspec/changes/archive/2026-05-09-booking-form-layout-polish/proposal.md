## Why

Después del refactoring a sub-componentes, surgieron problemas de layout y UX: estilos no se aplicaban por Angular View Encapsulation, labels del formulario de contacto estaban desalineados, y existía un bug de doble-submit al enviar el formulario. Estos fixes aseguran que el diseño sea consistente con el sistema de diseño y que la experiencia de usuario sea robusta.

## What Changes

- **Fix** double-submit bug with `loading()` guard in parent and `isSubmitting` guard in child
- **Fix** contact form label/input alignment by moving `<label>` outside `.input-wrapper`
- **Fix** `.step-card` and `.card-header` styles not applying due to View Encapsulation — move to each sub-component's SCSS
- **Add** `initialLoading` signal with spinner for initial data fetch state
- **Replace** hardcoded hex colors with CSS custom properties throughout
- **Add** responsive breakpoints (480px, 640px) for progress steps and form actions
- **Increase** `step-section` max-width to 600px for better content breathing room
- **Remove** inline styles from summary-step template, move to SCSS classes

## Capabilities

### New Capabilities
<!-- No new capabilities -->

### Modified Capabilities
- `booking-form`: Layout polish, responsive behavior, and double-submit prevention
- `ui-consistency`: Design token usage across booking-form sub-components

## Impact

- **Affected files**: 4 sub-component SCSS files, contact-form-step HTML, booking-form parent SCSS/TS
- **Tests**: 3 new tests for double-submit prevention (66 total passing)
- **No breaking changes**: Visual improvements only, no API or behavior changes
- **Build**: Angular compilation and production build verified
