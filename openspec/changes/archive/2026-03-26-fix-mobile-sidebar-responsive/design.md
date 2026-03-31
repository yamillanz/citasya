# Fix Mobile Sidebar Responsive - Design

## Overview

Arreglar la visualización del menú móvil en los layouts de backoffice (manager, superadmin, employee) modificando el orden de CSS layers de PrimeNG y ajustando z-index si es necesario.

## Files to Modify

### 1. PrimeNG Configuration
**File**: `app-web/src/app/app.config.ts`

**Current**:
```typescript
providePrimeNG({
  theme: {
    preset: AURA,
    options: {
      darkModeSelector: '.dark-mode',
      cssLayer: {
        name: 'primeng',
        order: 'theme, base, primeng'
      }
    }
  }
})
```

**Fix**: Cambiar el orden de CSS layers para que PrimeNG tenga prioridad:
```typescript
order: 'primeng, theme, base'
```

### 2. SCSS Files (3 archivos)
**Files**:
- `app-web/src/app/features/backoffice/backoffice.component.scss`
- `app-web/src/app/features/backoffice/superadmin/superadmin-layout.component.scss`
- `app-web/src/app/features/backoffice/employee/employee-layout.component.scss`

**Fix**: Agregar z-index explícito para el drawer móvil:
```scss
:host ::ng-deep {
  .mobile-sidebar-drawer {
    z-index: 1100 !important;

    .p-drawer {
      z-index: 1101 !important;
    }
  }
}
```

## Implementation Order

1. Modificar `app.config.ts` - corregir orden de CSS layers
2. Verificar funcionamiento en móvil
3. Si persiste, agregar z-index en los 3 archivos SCSS

## Verification

1. Abrir la aplicación en modo responsive (DevTools)
2. Reducir viewport a ≤1024px
3. Verificar que aparece el header móvil con hamburger
4. Tocar hamburger y verificar que drawer se abre
5. Verificar que overlay oscuro cubre la pantalla
6. Navegar por las opciones del menú
7. Cerrar drawer tocando fuera o botón
