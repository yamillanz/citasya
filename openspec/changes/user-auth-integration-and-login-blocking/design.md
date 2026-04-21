## Context

Actualmente, el sistema tiene dos problemas críticos relacionados con la autenticación y gestión de usuarios:

1. **Login sin validación de estado activo**: El `AuthService` (`app-web/src/app/core/services/auth.service.ts`) realiza `signInWithPassword()` contra Supabase Auth y luego consulta `profiles` para obtener datos adicionales (rol, compañía), pero nunca verifica el campo `is_active`. Un usuario desactivado puede navegar por la aplicación normalmente.

2. **Creación de usuarios incompleta**: Desde el panel de superadmin (`CentralManagementComponent`), al crear un usuario se invoca `UserService.create()` que inserta directamente en la tabla `profiles`. Como `profiles.id` es una FK a `auth.users(id)` sin valor por defecto, esta inserción probablemente falla silenciosamente o crea un registro huérfano. En cualquier caso, el usuario nuevo **nunca puede iniciar sesión** porque no existe en el sistema de autenticación de Supabase.

La arquitectura actual separa claramente `auth.users` (manejado por GoTrue/Supabase Auth) de `profiles` (tabla pública extendida). No existe trigger automático ni función edge que sincronice ambos mundos.

## Goals / Non-Goals

**Goals:**
- Bloquear el acceso a la aplicación para usuarios cuyo `profiles.is_active` sea `false`.
- Permitir que el superadmin cree usuarios completamente funcionales, con credenciales de email/password válidas en Supabase Auth.
- Mantener la seguridad del sistema: solo superadmins pueden crear usuarios, y la `service_role` key nunca se expone al frontend.

**Non-Goals:**
- Modificar el flujo de registro público (`signUp`) — no se utiliza actualmente.
- Enviar emails de invitación o confirmación automáticos.
- Implementar reset de contraseña desde el panel de superadmin.
- Sincronizar desactivaciones/activaciones hacia `auth.users` (se valida en login, no se elimina de Auth).
- Cambiar el schema de la base de datos (`profiles.is_active` ya existe).

## Decisions

### 1. Edge Function `create-user` en lugar de RPC SQL
**Rationale**: Supabase no permite insertar directamente en `auth.users` desde SQL porque:
- Las contraseñas deben hashearse con bcrypt usando parámetros internos de GoTrue.
- La tabla `auth.users` tiene triggers y metadata interna que una inserción manual rompería.
- El schema `auth` está protegido por diseño.

La Edge Function es el único mecanismo seguro que expone la Admin API (`supabase.auth.admin.createUser`) al frontend sin revelar el `service_role` key.

**Alternatives considered**: Llamar `supabase.auth.signUp()` directamente desde el frontend con una `service_role` key incrustada → descartado por ser un agujero de seguridad crítico.

### 2. Validación de `is_active` en `AuthService` (frontend) en lugar de trigger en `auth.users`
**Rationale**: Validar en `AuthService.signIn()` es el punto de control más directo. Permite:
- Mostrar el mensaje de error específico solicitado ("Tu cuenta ha sido desactivada. Contacta al administrador").
- Evitar modificaciones al schema protegido `auth.users`.
- Inmediata retroalimentación al usuario sin complejidad adicional de backend.

**Trade-off**: Un usuario desactivado sigue existiendo en `auth.users`, por lo que técnicamente podría usar otras funciones de Supabase (storage, etc.) si se les otorgan permisos directamente en RLS sin verificar `profiles`. Sin embargo, en este sistema todo el acceso a la aplicación pasa por `AuthService`.

### 3. `email_confirm: true` en la creación de usuario
**Rationale**: El requerimiento establece que el usuario debe estar "listo para ingresar" inmediatamente. Habilitar `email_confirm: true` evita que el nuevo usuario tenga que confirmar su email antes de iniciar sesión.

### 4. Campo `password` opcional en `CreateUserDto`
**Rationale**: La contraseña solo es necesaria en la creación de usuarios (para pasarla a la Edge Function), pero no es un campo persistente en la base de datos. Se agrega como opcional al DTO para no romper interfaces existentes donde no aplica.

## Risks / Trade-offs

- **[Risk]** La Edge Function `create-user` se convierte en un single point of failure para la creación de usuarios. Si falla, el superadmin no puede crear usuarios.
  - **Mitigation**: Manejo robusto de errores en `UserService.create()` con mensajes claros. Monitoreo de logs de Edge Functions.

- **[Risk]** Un superadmin introduce una contraseña débil para un nuevo usuario.
  - **Mitigation**: Validación de mínimo 6 caracteres en el frontend. Considerar en el futuro una política de contraseñas más fuerte.

- **[Risk]** Usuarios existentes creados antes de este cambio (que solo tienen `profiles` sin `auth.users`) siguen sin poder loguearse.
  - **Mitigation**: No aplica retroactivamente. Si es necesario, requeriría una migración manual o script de backfill fuera del scope de este cambio.

- **[Risk]** Si la Edge Function no verifica correctamente el rol del llamador, cualquier usuario autenticado podría crear usuarios.
  - **Mitigation**: La función valida explícitamente que el JWT pertenezca a un usuario con `role = 'superadmin'` en `profiles` antes de ejecutar `admin.createUser()`.

## Migration Plan

1. **Deploy Edge Function**:
   ```bash
   supabase functions deploy create-user
   ```
   
2. **Actualizar frontend**:
   - Modificar `AuthService`, `UserService`, modelos, y componentes.
   - Desplegar nueva versión de la aplicación Angular.

3. **Rollback**:
   - Si la Edge Function presenta problemas, se puede revertir `UserService.create()` al insert directo en `profiles` (aunque los usuarios nuevos seguirían sin poder loguearse).
   - Si el bloqueo de login causa problemas, se puede comentar temporalmente la validación de `is_active` en `AuthService.signIn()`.

## Open Questions

- ¿Se requiere una política de contraseñas más estricta que "mínimo 6 caracteres"?
- ¿Se desea en el futuro que la desactivación de un usuario también invalide su sesión activa inmediatamente (revocar tokens JWT)? Actualmente solo bloquea nuevos logins.
