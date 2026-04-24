## Why

El enlace "Características" en el header de la landing page no realiza el scroll hacia la sección correspondiente al hacer click. Esto ocurre porque Angular Router no tiene habilitada la funcionalidad de `anchorScrolling`, por lo que los enlaces con `fragment` no navegan al elemento con el ID correspondiente.

## What Changes

- Habilitar `anchorScrolling` en la configuración del router (`app.config.ts`) para que los enlaces con fragmentos funcionen correctamente en toda la aplicación.

## Capabilities

### New Capabilities
- `router-anchor-scrolling`: Configuración del router para soportar navegación por anclas/fragmentos en la landing page.

### Modified Capabilities
- (Ninguno)

## Impact

- `app-web/src/app/app.config.ts`: Se modificará la configuración de `provideRouter` para incluir `withInMemoryScrolling` con `anchorScrolling: 'enabled'`.
- Todos los enlaces con `fragment` en el header de la landing page y cualquier otra parte de la app comenzarán a funcionar correctamente.
