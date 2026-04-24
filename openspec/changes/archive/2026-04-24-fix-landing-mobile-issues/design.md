## Context

La landing page de holacitas fue diseñada desktop-first. En mobile (viewport < 1024px), el header fixed tiene el logo pegado al borde izquierdo porque `.header-container` usa `padding: 0` sin media query mobile. El drawer del menú hamburguesa utiliza un componente `p-dialog` de PrimeNG con estilos que no fueron optimizados para mobile: el header del diálogo no muestra el título "Menú" correctamente, los enlaces de navegación tienen `font-size: 1.0625rem` que en un drawer compacto se siente desproporcionado, y los botones de auth (`p-button`) con `w-full` son excesivamente altos.

Adicionalmente, el análisis de diseño detectó 3 anti-patterns:
1. `gradient-text` en `.headline-accent`
2. `side-tab` en `.mock-apt`
3. `layout-transition` en `.nav-link::after`

## Goals / Non-Goals

**Goals:**
- Corregir el padding del header en mobile para que el logo no toque el borde.
- Rediseñar el drawer mobile para que sea proporcionado, legible y profesional.
- Eliminar gradient text del headline hero.
- Eliminar side-stripe borders de los mock appointments.
- Reemplazar animación de `width` por `transform: scaleX()` en nav-links.

**Non-Goals:**
- No modificar el comportamiento funcional de navegación (ya arreglado en change anterior).
- No rediseñar el contenido de la landing page (hero text, features, etc.).
- No modificar la versión desktop del header o landing page.

## Decisions

- **Padding en header mobile**: Usar `padding: 0 var(--space-md)` en `.header-container` para `max-width: 1024px`. Esto alinea el logo con el contenido del hero que ya tiene `padding: ... var(--space-lg)`.
- **Drawer mobile**: Mantener `p-dialog` de PrimeNG pero ajustar los estilos internos. Reducir `font-size` de `mobile-nav-link` a `1rem`, reducir padding vertical de los botones de auth en mobile, y asegurar que el header del diálogo sea visible.
- **Gradient text**: Reemplazar con `color: var(--color-sage-dark)`. Mantiene el énfasis sin el tell de IA.
- **Side-stripe borders**: Reemplazar con `background: var(--color-sage-pale)` en el elemento completo o usar un `leading icon`. Se optará por un pequeño indicador de color usando `::before` con `width: 4px` y `border-radius` para mantener cohesión orgánica sin el tell clásico.
- **Nav-link animation**: Cambiar `transition: width` a `transform: scaleX(1)` con `transform-origin: left`. El pseudo-elemento `::after` ya tiene `width: 100%`, solo se oculta con `scaleX(0)`.

## Risks / Trade-offs

- [Risk] Cambiar el padding del header podría afectar ligeramente el centrado en desktop → Mitigación: aplicar solo en `max-width: 1024px`.
- [Risk] Eliminar gradient text podría hacer que el headline se sienta menos "especial" → Mitigación: usar un color sólido que complemente la paleta.
