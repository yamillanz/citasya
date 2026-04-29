# Proposal: add-header-allies

## Summary
La página de Aliados (allies.page) fue creada recientemente sin el `<app-landing-header />` que tienen todas las demás páginas públicas del módulo landing (home, pricing, contact, faq, about). Esto rompe la consistencia de navegación y el usuario no puede navegar entre secciones.

## Problem
- La página `/aliados` no muestra el header de navegación con enlaces a Inicio, Características, Precios, Sobre nosotros, Contacto, Aliados
- Las otras 5 páginas públicas (home, pricing, about, contact, faq) sí lo incluyen
- El componente `LandingHeaderComponent` ya tiene "Aliados" en su lista de `menuItems`

## Solution
1. Importar `LandingHeaderComponent` en `allies.page.ts`
2. Agregar `<app-landing-header />` al inicio del template `allies.page.html`

## Impact
- Solo 2 archivos modificados
- Sin cambios en lógica, estilos ni rutas
- Sin dependencias nuevas
