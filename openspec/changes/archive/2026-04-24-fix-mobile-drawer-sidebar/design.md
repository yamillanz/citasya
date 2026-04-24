## Context

El componente `LandingHeaderComponent` utiliza `p-dialog` de PrimeNG para mostrar el menú móvil. El `p-dialog` está diseñado para diálogos modales centrados, no para drawers laterales. En mobile, esto produce un componente flotante con bordes redondeados que no cubre la pantalla completa y permite ver el contenido de la landing page detrás.

## Goals / Non-Goals

**Goals:**
- Reemplazar `p-dialog` por `p-drawer` para obtener un drawer lateral nativo.
- Configurar el drawer para deslizar desde la derecha.
- Asegurar que el drawer ocupe toda la altura y tenga backdrop oscuro con blur.

**Non-Goals:**
- No modificar el contenido del drawer (links, botones de auth).
- No modificar la navegación desktop.

## Decisions

- **Usar `p-drawer` de PrimeNG 20**: Es el componente nativo de drawer/sidebar en PrimeNG moderno. Reemplaza completamente la necesidad de `p-dialog`.
- **Position `right`**: El menú hamburguesa está en la derecha del header, por lo que el drawer debe deslizar desde la derecha para coherencia mental.
- **Backdrop con blur**: Mejora la percepción de profundidad y enfoca la atención en el menú.

## Risks / Trade-offs

- [Risk] `DrawerModule` podría no estar disponible en versiones antiguas de PrimeNG → Mitigación: verificado que existe en PrimeNG 20.4.0.
