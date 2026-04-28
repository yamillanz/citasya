# Tasks: Listado Público de Aliados

## 1. Service Layer — CompanyService

- [x] 1.1 Agregar `getActiveCompaniesPaginated(page, size, search?)` en `CompanyService`

## 2. Service Layer — ServiceService

- [x] 2.1 Agregar `getServicesByCompanies(companyIds: string[])` en `ServiceService`

## 3. AlliesPage Component

- [x] 3.1 Crear `allies.page.ts` — lógica (signals, scroll infinito, búsqueda, estados)
- [x] 3.2 Crear `allies.page.html` — template (hero, search, grid, card, states)
- [x] 3.3 Crear `allies.page.scss` — estilos

## 4. Landing Header

- [x] 4.1 Agregar "Aliados" al menú del landing-header

## 5. Routing

- [x] 5.1 Agregar ruta perezosa `/aliados` en `app.routes.ts`

## 6. Testing

- [x] 6.1 Tests de AlliesPage
  - Archivo: `app-web/src/app/features/public/allies/allies.page.spec.ts`
  - Carga inicial muestra skeleton → grid
  - Búsqueda con debounce
  - Scroll infinito carga más
  - Estado vacío, error, sin más resultados
  - Navegación al hacer click en card

## 7. Verificación

- [ ] 7.1 Lint, build y tests pasan
- [ ] 7.2 Verificación visual en navegador
