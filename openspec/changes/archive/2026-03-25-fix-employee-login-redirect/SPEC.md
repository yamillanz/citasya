# SPEC: Fix Employee Login Redirect

## Problem Statement

Cuando un employee hacía login, era redirigido a `/bo/appointments`. Esta ruta está protegida por `managerGuard` que solo permite `['manager', 'superadmin']`. El employee recibía "Acceso Denegado".

## Root Cause

En `login.component.ts`, la función `redirectByRole()` redirigía incorrectamente:

```typescript
case 'employee':
  this.router.navigate(['/bo/appointments']);  // ❌ Ruta de manager
```

La ruta `/bo` tiene `canActivate: [authGuard, managerGuard]` que excluye employees.

## Solution

Cambiar la redirección del employee a su ruta correcta:

```typescript
case 'employee':
  this.router.navigate(['/emp/calendar']);  // ✅ Ruta de employee
```

## File Changed

- `app-web/src/app/features/auth/components/login/login.component.ts` (línea 79)

## Verification

1. Login con usuario employee
2. Verificar que redirige a `/emp/calendar`
3. Verificar que puede ver su calendario
