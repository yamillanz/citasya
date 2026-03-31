# Fix Mobile Sidebar Responsive - Specs

## Problem Statement

El menú lateral (sidebar) en los dashboards de backoffice no se muestra correctamente en dispositivos móviles. Cuando se accede desde un celular, el menú no es visible o no funciona correctamente.

## Affected Layouts

- Manager Dashboard (`backoffice.component`)
- Superadmin Dashboard (`superadmin-layout.component`)
- Employee Dashboard (`employee-layout.component`)

## Current Implementation

### Mobile Structure
1. **Desktop Sidebar**: `<aside class="sidebar">` - Hidden at `max-width: 1024px`
2. **Mobile Header**: `<header class="mobile-header">` - Visible only at `max-width: 1024px`
3. **Mobile Drawer**: `<p-drawer>` - PrimeNG Drawer para navegación móvil

### Components
- `sidebarVisible = signal(false)` - Controla visibilidad del drawer
- `[visible]="sidebarVisible()"` - Binding al drawer
- `(visibleChange)="sidebarVisible.set($event)"` - Actualiza señal al cerrar

## Issues Identified

### 1. CSS Layer Order (Probable causa principal)
En `app.config.ts`:
```typescript
order: 'theme, base, primeng'
```
Este orden puede hacer que los estilos del tema sobreescriban los estilos del drawer de PrimeNG, ocultando el drawer o su backdrop.

### 2. Z-Index Faltante
Los estilos SCSS no definen un z-index explícito para el drawer, lo que puede causar que quede debajo de otros elementos.

### 3. Altura del Drawer
`.p-drawer-content { height: 100% }` puede no funcionar si el padre no tiene altura explícita.

## Expected Behavior

1. En móvil (≤1024px): El sidebar de desktop debe estar oculto
2. El header móvil debe mostrar el hamburger menu
3. Al tocar el hamburger, el drawer debe abrirse desde la izquierda
4. El drawer debe tener overlay oscuro de fondo
5. El contenido del drawer debe ser desplazable

## Scenarios

### Scenario 1: Usuario accede desde desktop
- Ve el sidebar permanente a la izquierda
- No ve el header móvil

### Scenario 2: Usuario accede desde móvil
- Ve el header móvil con logo y hamburger
- Al tocar hamburger, drawer se abre desde la izquierda
- Puede navegar y cerrar sesión desde el drawer

### Scenario 3: Drawer se cierra
- Toca fuera del drawer o botón de cerrar
- Drawer se cierra y vuelve al contenido principal
