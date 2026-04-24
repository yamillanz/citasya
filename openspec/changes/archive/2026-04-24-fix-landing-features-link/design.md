## Context

El header de la landing page utiliza `routerLink` con `fragment` para navegar a la sección de características (`/#features`). Angular Router requiere la configuración `anchorScrolling: 'enabled'` para que los fragmentos de URL desencadenen el scroll automático hacia el elemento con el ID correspondiente. Actualmente esta configuración no está presente en `app.config.ts`.

## Goals / Non-Goals

**Goals:**
- Hacer que el enlace "Características" del header funcione correctamente navegando a la sección `#features`.
- Habilitar el anchor scrolling de forma global para cualquier enlace con fragmentos en la aplicación.

**Non-Goals:**
- Modificar el componente `LandingHeaderComponent`.
- Modificar la landing page o la sección de features.
- Cambiar el comportamiento de navegación entre rutas distintas.

## Decisions

- **Usar `withInMemoryScrolling` en lugar de `withRouterConfig`**: `withInMemoryScrolling` es el feature provider recomendado en Angular 18+ para configurar el comportamiento de scroll. Incluye `anchorScrolling` y `scrollPositionRestoration`.
- **No usar `scrollPositionRestoration: 'enabled'`**: Aunque suele acompañar `anchorScrolling`, el scope de este cambio es mínimo y solo se habilitará `anchorScrolling` para no modificar el comportamiento existente de restauración de scroll entre rutas.

## Risks / Trade-offs

- [Risk] Cambiar la configuración global del router podría afectar otros enlaces con fragmentos si existen comportamientos no deseados → Mitigación: `anchorScrolling` solo afecta a URLs con `#id`, lo cual es el comportamiento esperado por defecto.
