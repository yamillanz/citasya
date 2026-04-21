## 1. Backend - Edge Function `create-user`

- [x] 1.1 Crear directorio y archivo `supabase/functions/create-user/index.ts`
- [x] 1.2 Implementar verificación de JWT y extracción de usuario autenticado
- [x] 1.3 Implementar validación de rol superadmin consultando `profiles`
- [x] 1.4 Implementar creación de usuario en Supabase Auth con `admin.createUser({ email, password, email_confirm: true })`
- [x] 1.5 Implementar inserción automática del perfil en `profiles` con datos recibidos e `is_active = true`
- [x] 1.6 Implementar manejo de errores (duplicado → 409, no superadmin → 403, sin auth → 401, campos faltantes → 400)
- [x] 1.7 Deployar la Edge Function con `supabase functions deploy create-user`

## 2. Frontend - Modelos y Servicios

- [x] 2.1 Actualizar `CreateUserDto` en `app-web/src/app/core/models/user.model.ts` para incluir `password?: string`
- [x] 2.2 Modificar `AuthService.signIn()` en `app-web/src/app/core/services/auth.service.ts` para validar `is_active` después de obtener datos del perfil, lanzar error descriptivo y hacer signOut si está inactivo
- [x] 2.3 Modificar `AuthService.getCurrentUser()` para validar `is_active` y retornar `null` con signOut si está inactivo
- [x] 2.4 Modificar `UserService.create()` en `app-web/src/app/core/services/user.service.ts` para invocar la Edge Function `create-user` vía `supabase.functions.invoke()`
- [x] 2.5 Asegurar que `UserService.create()` maneje errores HTTP de la Edge Function y los propague apropiadamente

## 3. Frontend - UI de Superadmin

- [x] 3.1 Agregar campo `password` al `userFormData` en `CentralManagementComponent` con valor inicial vacío
- [x] 3.2 Agregar input `<p-password>` al template del diálogo de "Nuevo Usuario" en `central-management.component.html`
- [x] 3.3 Implementar validación en `saveUser()`: contraseña requerida y mínimo 6 caracteres para creación
- [x] 3.4 Asegurar que `saveUser()` pase el campo `password` al DTO cuando llama `userService.create()`
- [x] 3.5 Asegurar que el campo contraseña no se envíe en operaciones de edición (`editingUser()`)

## 4. Verificación y Pruebas

- [x] 4.1 Build de Angular exitoso — sin errores de TypeScript
- [x] 4.2 Flujo de login revisado — validación de `is_active` implementada en `AuthService.signIn()` y `getCurrentUser()`
- [x] 4.3 Flujo de creación revisado — `UserService.create()` invoca Edge Function, formulario incluye contraseña
- [ ] 4.4 Probar login con usuario activo → debe funcionar normalmente
- [ ] 4.5 Probar login con usuario inactivo (`is_active = false`) → debe mostrar mensaje "Tu cuenta ha sido desactivada. Contacta al administrador."
- [ ] 4.6 Probar creación de usuario desde superadmin con email, nombre, rol y contraseña → debe crear usuario en Auth y en profiles
- [ ] 4.7 Probar login inmediato con el usuario recién creado → debe funcionar
- [ ] 4.8 Probar creación con email duplicado → debe mostrar error "El email ya existe"
- [ ] 4.9 Probar creación con contraseña corta (< 6 caracteres) → debe mostrar error de validación
