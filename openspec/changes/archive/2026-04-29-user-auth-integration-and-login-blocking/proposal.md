## Why

El sistema actual permite que usuarios inactivos (`is_active = false`) inicien sesión sin restricción, lo que representa un agujero de seguridad. Además, el superadmin puede crear usuarios desde el panel central, pero estos registros solo se insertan en `profiles` sin crear el correspondiente registro en `auth.users` de Supabase, lo que hace que los usuarios nuevos nunca puedan iniciar sesión. Este cambio cierra ambas brechas.

## What Changes

- **Bloqueo de login para usuarios inactivos**: El `AuthService` validará el campo `is_active` del perfil después de autenticar con Supabase Auth. Si el usuario está inactivo, se rechazará el acceso con un mensaje específico.
- **Creación atómica de usuarios en Supabase Auth**: Se creará una Edge Function `create-user` que, protegida por JWT y rol superadmin, utilice la Admin API de Supabase para crear el usuario en `auth.users` y su perfil en `profiles` en una sola operación.
- **Campo de contraseña en diálogo de creación**: El formulario de "Nuevo Usuario" del superadmin incluirá un campo de contraseña inicial requerida (mínimo 6 caracteres).
- **Actualización de `UserService.create()`**: Dejará de insertar directamente en `profiles` para invocar la Edge Function `create-user`.

## Capabilities

### New Capabilities
- `auth-user-creation`: Capacidad del backend para crear usuarios completos en Supabase Auth + profiles de forma segura mediante Edge Function.

### Modified Capabilities
- `superadmin-users`: El requerimiento de creación de usuarios cambia — ahora el sistema debe crear el usuario en Supabase Auth (no solo en `profiles`) y requiere una contraseña inicial en el formulario.

## Impact

- **Backend**: Nueva Edge Function en `supabase/functions/create-user/`.
- **Frontend - Auth**: `AuthService.signIn()` y `AuthService.getCurrentUser()` en `app-web/src/app/core/services/auth.service.ts`.
- **Frontend - Superadmin**: `UserService.create()`, `CentralManagementComponent`, y modelo `CreateUserDto` en `app-web/src/app/core/models/user.model.ts`.
- **Seguridad**: Los usuarios desactivados perderán acceso inmediato; los usuarios nuevos serán funcionales desde el momento de la creación.
