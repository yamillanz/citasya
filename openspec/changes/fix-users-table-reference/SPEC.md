# SPEC: Fix users table reference to profiles

## Problem Statement

La tabla `users` no existe en la base de datos Supabase. El schema define una tabla llamada `profiles` pero el código Angular consulta `users`, causando el error:

```
{"code":"PGRST205","hint":"Perhaps you meant the table 'public.services'","message":"Could not find the table 'public.users' in the schema cache"}
```

## Root Cause

- **Schema DB**: Tabla `profiles` con campos: id, email, full_name, phone, photo_url, role, company_id, is_active, created_at, updated_at
- **Código Angular**: Usa `.from('users')` en auth.service.ts y user.service.ts

## Affected Files

1. `app-web/src/app/core/services/auth.service.ts`
   - Línea 44: `.from('users')` → `.from('profiles')`
   - Línea 59: `.from('users')` → `.from('profiles')`

2. `app-web/src/app/core/services/user.service.ts`
   - Línea 11: `.from('users')` → `.from('profiles')`
   - Línea 24: `.from('users')` → `.from('profiles')`
   - Línea 35: `.from('users')` → `.from('profiles')`
   - Línea 45: `.from('users')` → `.from('profiles')`
   - Línea 56: `.from('users')` → `.from('profiles')`
   - Línea 67: `.from('users')` → `.from('profiles')`
   - Línea 78: `.from('users')` → `.from('profiles')`
   - Línea 90: `.from('users')` → `.from('profiles')`
   - Línea 99: `.from('users')` → `.from('profiles')`
   - Línea 111: `.from('users')` → `.from('profiles')`

## Verification

1. Hacer `npm run start` y verificar que no haya warnings de NG8113
2. Probar login con credenciales válidas
3. Verificar que la consulta GET `profiles?id=eq.xxx` retorne datos正确
