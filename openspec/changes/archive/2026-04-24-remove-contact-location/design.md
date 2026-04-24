## Context

El componente `contact.component.html` contiene una columna de información de contacto (`info-column`) con 4 items: Email, Teléfono, Horario, y Ubicación. Debajo del formulario hay una sección `.map-section` con un placeholder visual que muestra un pin de mapa y el texto "Ciudad de México, México". Como holacitas es un SaaS, no hay una ubicación física que los usuarios necesiten visitar.

## Goals / Non-Goals

**Goals:**
- Remover toda referencia a ubicación física del template
- Limpiar SCSS asociado

**Non-Goals:**
- Modificar el formulario de contacto
- Modificar el hero section o info cards restantes
- Agregar nueva funcionalidad

## Decisions

**1. Remover `.map-section` completa**
- Es un placeholder decorativo sin funcionalidad real. Ocupa espacio vertical y añade carga visual.

**2. Remover `.info-item` de Ubicación de la lista**
- Aunque está en la columna lateral junto a datos reales (email, teléfono), "Ciudad de México" no es un dato operativo del producto SaaS. Mantenerlo mezcla información real con ficticia.

## Risks / Trade-offs

- **[Risk]** Algunos usuarios pueden esperar ver una dirección física.
  - **Mitigation**: Un SaaS de gestión de citas no requiere visita física. El email y teléfono son suficientes.

## Migration Plan

No requiere migración. Cambio de UI puro.
