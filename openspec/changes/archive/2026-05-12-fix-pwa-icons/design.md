## Context

El favicon de la aplicación en `src/index.html` es un SVG inline que representa un calendario verde (`#9DC183`) con puntos blancos, coherente con la marca de holacitas. Sin embargo, los archivos PNG referenciados en `manifest.webmanifest` (ubicados en `public/icons/`) son los iconos por defecto del template de Angular (shield rojo). Cuando un usuario instala la PWA en Android, iOS o escritorio, el sistema operativo consume los PNGs del manifest, mostrando el icono incorrecto.

## Goals / Non-Goals

**Goals:**
- Todos los tamaños de icono requeridos por el manifest deben renderizar el calendario verde de marca.
- El `favicon.ico` debe coincidir visualmente con el icono de marca.
- El cambio debe ser puro reemplazo de activos, sin modificar código fuente ni configuración del build.

**Non-Goals:**
- No se modificarán rutas del manifest, metadatos del `index.html`, ni configuración del service worker.
- No se introducen nuevas dependencias npm.
- No se rediseña el icono; se reutiliza el SVG existente.

## Decisions

- **Fuente única de verdad**: Se extraerá el SVG inline de `index.html` y se usará como entrada para generar todos los PNGs vía ImageMagick (`convert`). Esto garantiza consistencia pixel-perfect entre favicon y iconos de instalación.
- **Resoluciones a generar**: 72×72, 96×96, 128×128, 144×144, 152×152, 192×192, 384×384, 512×512 (las 8 resoluciones ya definidas en `manifest.webmanifest`).
- **Formato de salida**: PNG-24 con transparencia, mismo formato y nombres de archivo actuales para evitar cambios en el manifest.
- **favicon.ico**: Se generará a 256×256 con el mismo SVG y se convertirá a `.ico` multi-resolución (256×256, 64×64, 32×32, 16×16) para máxima compatibilidad con navegadores legacy.

## Risks / Trade-offs

- **[Risk]** ImageMagick puede suavizar bordes finos al rasterizar SVG → **Mitigación**: usar densidad de 300 DPI y escalar con `convert -background none -density 300 input.svg -resize WxH output.png`.
- **[Risk]** Algunos dispositivos antiguos no soportan iconos maskable con transparencia completa → **Mitigación**: el manifest ya marca los iconos como `"purpose": "maskable any"`; los PNGs tendrán fondo transparente pero el SVG tiene un rectángulo redondeado de fondo sólido que actúa como área segura.

## Migration Plan

1. Extraer SVG a archivo temporal.
2. Generar los 8 PNGs en `public/icons/` (sobrescribir existentes).
3. Generar `public/favicon.ico` (sobrescribir existente).
4. Verificar que `manifest.webmanifest` y `index.html` no requieren cambios.
5. No se requiere rollback especial: si hay problema, revertir los archivos binarios con git.

## Open Questions

- (Ninguno)
