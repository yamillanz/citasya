# Fix Mobile Sidebar Responsive - Tasks

## 1. CSS Layer Fix

- [x] 1.1 Modificar `app-web/src/app/app.config.ts` - cambiar orden de CSS layers de `'theme, base, primeng'` a `'primeng, theme, base'`

## 2. Verification

- [ ] 2.1 Probar enDevTools con viewport móvil (≤1024px)
- [ ] 2.2 Verificar que el drawer se abre al tocar el hamburger
- [ ] 2.3 Verificar que el overlay oscuro aparece
- [ ] 2.4 Verificar navegación en el drawer
- [ ] 2.5 Verificar que se cierra correctamente

## 3. Z-Index Fallback (si necesario)

- [x] 3.1 Agregar z-index en `backoffice.component.scss`
- [x] 3.2 Agregar z-index en `superadmin-layout.component.scss`
- [x] 3.3 Agregar z-index en `employee-layout.component.scss`
