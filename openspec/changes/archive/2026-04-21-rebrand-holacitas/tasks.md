## 1. Logo SVG — Actualizar las 18 instancias inline

- [x] 1.1 Actualizar logo en `landing-header.component.html` (2 instancias: desktop header + mobile drawer) — `CITASYA` → `holacitas`, `.APP` → `.app`, ajustar viewBox/font-size
- [x] 1.2 Actualizar logo en `login.component.html` (1 instancia)
- [x] 1.3 Actualizar logos en `backoffice.component.html` (3 instancias: manager sidebar + mobile header + mobile sidebar)
- [x] 1.4 Actualizar logos en `superadmin-layout.component.html` (3 instancias: superadmin sidebar + mobile header + mobile sidebar)
- [x] 1.5 Actualizar logos en `employee-layout.component.html` (3 instancias: employee sidebar + mobile header + mobile sidebar)
- [x] 1.6 Actualizar logo en `home.component.html` footer (1 instancia)
- [x] 1.7 Actualizar logo en `booking-form.component.html` (1 instancia)
- [x] 1.8 Actualizar logo en `company-list.component.html` (1 instancia)
- [x] 1.9 Actualizar logo en `employee-calendar.component.html` (1 instancia)

## 2. Copy/Texto de marca — Actualizar menciones en contenido

- [x] 2.1 Actualizar "CitasYa" → "holacitas" en `home.component.html` (4 instancias: líneas 57, 118, 252, 300)
- [x] 2.2 Actualizar "CitasYa" → "holacitas" en `about.component.html` (5 instancias: líneas 18, 32, 38, 126, 177)
- [x] 2.3 Actualizar "CitasYa" → "holacitas" en `faq.component.html` (6 instancias: líneas 20, 52, 60, 131, 150, 164)
- [x] 2.4 Actualizar "CitasYa" → "holacitas" en `pricing.component.html` (1 instancia: línea 359)
- [x] 2.5 Actualizar "CitasYa" → "holacitas" en `login.component.html` (1 instancia: línea 122)
- [x] 2.6 Actualizar "CitasYa" → "holacitas" en `dashboard.component.ts` (1 instancia: línea 8)

## 3. Favicon y Meta Tags

- [x] 3.1 Actualizar título en `index.html`: "CitasYa - Gestiona tus citas profesionales" → "holacitas - Gestiona tus citas profesionales"
- [x] 3.2 Reemplazar favicon inline SVG en `index.html` con nuevo diseño de calendario
- [x] 3.3 Regenerar `favicon.ico` con el mismo diseño de calendario (convertir SVG a ICO)

## 4. Dominio y Email

- [x] 4.1 Actualizar email en `unauthorized.component.html`: `soporte@citasya.app` → `soporte@holacitas.app`
- [x] 4.2 Actualizar email en `contact.component.html`: `hola@citasya.app` → `hola@holacitas.app`

## 5. Documentación interna

- [x] 5.1 Actualizar título en `docs/TESTING.md`: "CitasYa" → "holacitas"
- [x] 5.2 Actualizar referencias en `openspec/changes/archive/2026-04-06-global-modal-styles/proposal.md`
- [x] 5.3 Actualizar referencias en `openspec/changes/archive/2026-04-06-global-modal-styles/design.md`
- [x] 5.4 Actualizar referencias en `openspec/changes/add-booking-link-to-employee/design.md`
- [x] 5.5 Actualizar referencias en `openspec/changes/archive/2026-04-03-enhance-public-booking-form/design.md`

## 6. Verificación

- [x] 6.1 Ejecutar `ng build` y verificar compilación sin errores
- [x] 6.2 Ejecutar `grep -ri "citasya" app-web/src/` y verificar 0 resultados en archivos de producción
- [x] 6.3 Verificar visualmente logos en desktop y mobile (landing, login, backoffice manager/superadmin/employee)
- [x] 6.4 Verificar favicon en navegador
- [x] 6.5 Verificar título de pestaña del navegador
- [x] 6.6 Verificar links de mailto apuntan a `@holacitas.app`
