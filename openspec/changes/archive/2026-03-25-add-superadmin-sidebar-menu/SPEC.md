# SPEC: Add Sidebar Menu to Superadmin Dashboard

## Problem Statement

El dashboard de superadmin actualmente no tiene un menú lateral visible en desktop como el de manager. Se necesita agregar un panel de menú con las opciones básicas.

## Menu Items

| Label | Icon | Route | Status |
|-------|------|-------|--------|
| Companies | `pi pi-building` | `/sa/companies` | Existente |
| Users | `pi pi-users` | `/sa/users` | Existente |
| Plans | `pi pi-credit-card` | `/sa/plans` | Existente |
| Transactions | `pi pi-credit-card` | `/sa/transactions` | Nuevo (placeholder) |

## Implementation

1. **SuperadminLayoutComponent** (`superadmin-layout.component.ts`):
   - Agregar `Transactions` al array `menuItems`
   - La ruta `/sa/transactions` mostrará un componente placeholder

2. **SuperadminRoutes** (`superadmin.routes.ts`):
   - Agregar ruta para `/sa/transactions`

3. **Placeholder Component** (`superadmin-transactions.component.ts`):
   - Componente simple con mensaje de "Próximamente" o tabla vacía

## Files to Modify/Create

- `app-web/src/app/features/backoffice/superadmin/superadmin-layout.component.ts`
- `app-web/src/app/features/backoffice/superadmin/superadmin.routes.ts`
- Crear: `app-web/src/app/features/backoffice/superadmin/transactions/superadmin-transactions.component.ts`
- Crear: `app-web/src/app/features/backoffice/superadmin/transactions/superadmin-transactions.component.html`

## Color Scheme

El superadmin usa color púrpura/violeta para estado activo (`#8B5CF6`).

## Verification

1. Verificar que el sidebar aparece en desktop
2. Verificar que todas las opciones de menú son clickeables
3. Verificar que la ruta `/sa/transactions` muestra el placeholder
