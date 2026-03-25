# TASK: Fix users table reference to profiles

## Tasks

- [x] Cambiar `.from('users')` a `.from('profiles')` en `auth.service.ts` líneas 44 y 59
- [x] Cambiar `.from('users')` a `.from('profiles')` en `user.service.ts` líneas 11, 24, 35, 45, 56, 67, 78, 90, 99, 111
- [x] Verificar con `npm run build` que no hay errores
