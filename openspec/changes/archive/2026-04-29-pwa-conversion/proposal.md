## Why

CitasYa necesita ser instalable como Progressive Web App para mejorar la experiencia móvil de usuarios que acceden frecuentemente desde sus teléfonos. Una PWA permite: instalación directa sin pasar por tiendas de apps, acceso offline al shell de la aplicación, carga más rápida en visitas repetidas, y experiencia nativa (standalone, sin chrome del navegador). Esto es crítico ahora porque la mayoría del tráfico de booking público proviene de dispositivos móviles.

## What Changes

- Instalación de `@angular/service-worker` como dependencia del proyecto
- Configuración de `ngsw-config.json` con estrategia de cacheo para app shell (prefetch), assets (lazy), y Google Fonts CDN (lazy)
- Creación de `manifest.webmanifest` con nombre, íconos, colores de marca (`#9DC183` / `#FAF8F5`), y display standalone
- Generación de íconos PWA (72 a 512px) en `public/icons/`
- Registro del service worker en `app.config.ts` vía `provideServiceWorker()`
- Servicio `PwaUpdateService` que detecta nuevas versiones y notifica al usuario vía PrimeNG Toast
- Actualización de `index.html` con meta tags PWA (theme-color, apple-mobile-web-app-capable, apple-touch-icon)
- Configuración de `serviceWorker` en `angular.json` para el build

## Capabilities

### New Capabilities
- `pwa-service-worker`: Registro y configuración del Angular service worker para cacheo offline de assets estáticos y notificación de actualizaciones
- `pwa-manifest`: Manifiesto de aplicación web progresiva con metadatos, íconos y colores de marca para instalabilidad
- `pwa-update-notification`: Detección de nuevas versiones desplegadas y notificación al usuario para actualizar vía PrimeNG Toast

### Modified Capabilities
<!-- No existing specs need requirement changes -->

## Impact

- **Dependencies**: Nueva dependencia `@angular/service-worker` (~20.3.0)
- **Build**: `angular.json` añade `serviceWorker` option; build producción genera `ngsw.json` y `ngsw-worker.js`
- **Assets**: Nuevos íconos PNG en `public/icons/`; `manifest.webmanifest` en `public/`
- **Config**: `app.config.ts` añade `provideServiceWorker()`; nuevo servicio `pwa-update.service.ts`
- **HTML**: `index.html` añade meta tags PWA y link al manifest
- **Caching**: El SW cachea recursos de Google Fonts CDN → requiere conexión inicial para precachear
