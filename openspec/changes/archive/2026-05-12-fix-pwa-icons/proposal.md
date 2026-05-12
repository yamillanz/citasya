## Why

La aplicación PWA de holacitas muestra el icono por defecto de Angular (shield rojo) cuando se instala en dispositivos móviles o escritorio. Esto ocurre porque los archivos PNG referenciados en `manifest.webmanifest` aún son los iconos generados por el template inicial de Angular, en lugar del icono de marca (calendario verde) que aparece en la pestaña del navegador.

## What Changes

- Reemplazar todos los iconos PNG del manifest (`public/icons/icon-*.png`) con versiones generadas a partir del mismo SVG del favicon (calendario verde `#9DC183`).
- Actualizar `public/favicon.ico` para que también use el icono de marca en lugar del de Angular.
- No se modifican rutas ni estructura del `manifest.webmanifest` ni `index.html`; solo el contenido de los archivos de imagen.

## Capabilities

### New Capabilities
- `pwa-brand-icons`: Generación y distribución de iconos PNG en todos los tamaños requeridos por el manifest (72x72 a 512x512) y favicon.ico, utilizando el SVG de marca como fuente única.

### Modified Capabilities
- (Ninguno — no hay cambios de comportamiento ni requisitos, solo activos estáticos)

## Impact

- Archivos estáticos en `app-web/public/icons/*`
- Archivo estático `app-web/public/favicon.ico`
- Sin impacto en código fuente, APIs ni dependencias
