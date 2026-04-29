## Context

CitasYa es una aplicación Angular 20.3 standalone (sin NgModules) que actualmente no tiene soporte PWA. El proyecto usa:
- Builder `@angular/build:application` (esbuild-based, moderno)
- Configuración vía `app.config.ts` con `ApplicationConfig` y providers funcionales
- PrimeNG v20 con Aura theme para UI
- Supabase como backend (auth + base de datos)
- Google Fonts (DM Sans + Fraunces) cargados desde CDN
- `public/` folder con solo `favicon.ico` (sin íconos PWA)

La conversión a PWA debe ser mínimamente invasiva, aprovechando el schematic oficial de Angular (`ng add @angular/pwa`) y luego personalizando para la marca.

## Goals / Non-Goals

**Goals:**
- Hacer la app instalable en dispositivos móviles y desktop (Chrome, Edge, Safari)
- Cachear app shell (index.html, bundles JS/CSS) para carga offline de la UI base
- Cachear Google Fonts para que las fuentes estén disponibles offline
- Notificar al usuario cuando haya una nueva versión desplegada
- Mantener compatibilidad total con el build actual y PrimeNG

**Non-Goals:**
- Soporte offline para operaciones CRUD (requiere Supabase en backend, fuera de scope)
- Estrategias de cacheo avanzadas para datos dinámicos de API
- Self-hosting de Google Fonts (se cachean vía SW en su lugar)
- Push notifications
- Background sync

## Decisions

### D1: Usar `ng add @angular/pwa` como generador base
**Decisión**: Ejecutar el schematic oficial para generar la configuración inicial, luego personalizar manualmente los archivos generados.

**Alternativas consideradas**:
- Configurar manualmente: más control pero propenso a errores de omisión (ej: olvidar `ngsw-config.json` en `assets`). El schematic maneja toda la integración correctamente.
- Workbox manual: sobre-ingeniería para este caso. Angular SW ya cubre las necesidades.

**Rationale**: El schematic de Angular está probado, se integra con el builder automáticamente, y genera íconos multi-resolución. Menos riesgo de configuración incorrecta.

### D2: `registrationStrategy: 'registerWhenStable:30000'`
**Decisión**: Usar la estrategia por defecto que espera a que la app se estabilice antes de registrar el SW.

**Alternativas consideradas**:
- `registerImmediately`: Competiría por ancho de banda durante la carga inicial, ralentizando el primer render.
- Sin timeout: Podría nunca registrarse si la app tiene polling/timers que impiden la estabilización.

**Rationale**: 30s es suficiente para que la app se estabilice incluso con conexiones lentas. Si no se estabiliza, el SW se registra de todas formas tras el timeout.

### D3: Google Fonts en grupo `lazy` separado
**Decisión**: Crear un asset group específico con `urls` para `https://fonts.googleapis.com/**` y `https://fonts.gstatic.com/**` con `installMode: lazy`.

**Alternativas consideradas**:
- `prefetch`: Ralentizaría la instalación inicial del SW porque las fuentes pesan ~200KB.
- No cachear: Las fuentes no estarían disponibles offline, degradando la experiencia.
- Self-hosting: Mejor a largo plazo pero requiere más trabajo (descargar WOFF2, modificar imports CSS).

**Rationale**: `lazy` permite que las fuentes se cacheen en el primer uso sin bloquear la precarga del app shell. En visitas subsiguientes estarán cacheadas.

### D4: PrimeNG Toast para notificaciones de actualización
**Decisión**: Usar `MessageService` (PrimeNG Toast) para notificar al usuario sobre actualizaciones disponibles, con acción "Actualizar ahora".

**Alternativas consideradas**:
- `p-dialog` modal: Demasiado intrusivo. El usuario podría estar en medio de una operación.
- `window.confirm()`: No se integra con el design system.
- Auto-recarga sin aviso: Podría causar pérdida de datos si el usuario está llenando un formulario.

**Rationale**: Toast es no-bloqueante, consistente con el sistema de notificaciones existente, y permite al usuario decidir cuándo actualizar.

### D5: No modificar `app.routes.ts` ni guards
**Decisión**: La PWA no requiere cambios en rutas ni lógica de autenticación. El SW solo cachea assets estáticos; las rutas dinámicas y API calls siguen funcionando normalmente.

**Rationale**: Separación de concerns. La capa de servicio worker es ortogonal al routing y auth.

## Risks / Trade-offs

- **[Riesgo] Google Fonts no cacheadas si el usuario nunca visitó con conexión** → Las fuentes son críticas para la identidad visual. Si el usuario abre la PWA offline sin haber visitado antes online, verá fuentes del sistema (fallback). **Mitigación**: En una fase futura, considerar self-hosting de fuentes para que estén en el precache inicial.

- **[Riesgo] `ngsw-config.json` no sincronizado con `angular.json` assets** → Si se añaden nuevas carpetas de assets en el futuro, el `ngsw-config.json` debe actualizarse manualmente. **Mitigación**: Documentar en el archivo que cualquier cambio en `assets` de `angular.json` requiere revisar `ngsw-config.json`.

- **[Trade-off] Sin soporte offline para datos** → La app sigue requiriendo conexión para cualquier operación CRUD. Es aceptable para esta fase porque el objetivo principal es instalabilidad y cacheo de shell, no offline-first completo.

- **[Riesgo] Íconos PWA desactualizados si cambia el branding** → Los íconos PNG son estáticos. Si el logo cambia, hay que regenerarlos. **Mitigación**: Documentar el proceso de regeneración en el README o AGENTS.md.
