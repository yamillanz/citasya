# Proposal: Fix Mobile Sidebar Responsive

## Summary

El menú lateral (sidebar) en los dashboards de backoffice no es visible ni funcional en dispositivos móviles debido a un problema con el orden de CSS layers de PrimeNG.

## Problem

En vista móvil (≤1024px), el menú no se muestra correctamente. El drawer de PrimeNG no se visualiza o no funciona.

## Solution

1. Corregir el orden de CSS layers en `app.config.ts` para que los estilos de PrimeNG tengan prioridad sobre el tema
2. Si persiste, agregar z-index explícito a los componentes del drawer

## Impact

- Affecta 3 layouts: Manager, Superadmin, Employee
- Solo impacto visual en móvil
- Sin riesgo para funcionalidad existente en desktop

## Effort

Bajo - solo cambios en configuración y CSS
