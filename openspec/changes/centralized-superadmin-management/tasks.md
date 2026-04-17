## 1. Scaffolding & Routes

- [x] 1.1 Create directory `app-web/src/app/features/backoffice/superadmin/central-management/`
- [x] 1.2 Create `central-management.component.ts` with standalone component scaffold: imports, signals skeleton, inject services (CompanyService, UserService, PlanService, MessageService, ConfirmationService), ChangeDetectionStrategy.OnPush
- [x] 1.3 Update `superadmin.routes.ts`: replace `companies` and `users` routes with single `management` route lazy-loading `CentralManagementComponent`, change default redirect from `companies` to `management`
- [x] 1.4 Update `superadmin-layout.component.ts`: change menu items from 4 items (Empresas, Usuarios, Planes, Transacciones) to 3 items (Gestión → /sa/management, Planes, Transacciones)
- [x] 1.5 Update `superadmin-layout.component.html` if sidebar links are hardcoded (verify and adjust if needed)
- [x] 1.6 Verify app compiles: `cd app-web && npx ng build --configuration=development`

## 2. Companies Table with Row Editing

- [x] 2.1 Implement company state signals: `companies`, `plans`, `loading`, `saving`, `searchTerm`, `statusFilter`, `planFilter`, `selectedCompanies`, `editingCompanyId`, `clonedCompanies`
- [x] 2.2 Implement `filteredCompanies` computed signal filtering by searchTerm, statusFilter, and planFilter
- [x] 2.3 Implement `loadCompanies()` async method loading companies and plans in parallel
- [x] 2.4 Implement row editing lifecycle methods: `onCompanyRowEditInit`, `onCompanyRowEditSave` (calls `companyService.update`), `onCompanyRowEditCancel` (reverts from clone)
- [x] 2.5 Implement `selectCompany()` method: sets `selectedCompanyId` and `selectedCompanyName`, calls `loadUsers()`, toggles off if same company clicked again
- [x] 2.6 Implement `confirmToggleCompany()` method with ConfirmationService for activate/deactivate
- [x] 2.7 Implement bulk actions: `bulkActivateCompanies()` and `bulkDeactivateCompanies()` filtering selected array and calling service methods
- [x] 2.8 Implement `clearFilters()` method resetting searchTerm, statusFilter, planFilter
- [x] 2.9 Implement dialog methods: `openCreateCompanyDialog()`, `saveCompany()` (create/update with error handling for duplicate slug), `generateSlug()`

## 3. Users Panel with Row Editing

- [x] 3.1 Implement user state signals: `users`, `usersLoading`, `selectedCompanyId`, `selectedCompanyName`, `selectedUsers`, `editingUserId`, `clonedUsers`
- [x] 3.2 Implement `loadUsers(companyId)` async method loading users filtered by company
- [x] 3.3 Implement user row editing lifecycle: `onUserRowEditInit`, `onUserRowEditSave` (calls `userService.update` for full_name, phone, role), `onUserRowEditCancel`
- [x] 3.4 Implement `confirmToggleUser()` method with ConfirmationService for user activate/deactivate
- [x] 3.5 Implement bulk actions: `bulkActivateUsers()` and `bulkDeactivateUsers()` with confirmation dialog and service calls
- [x] 3.6 Implement dialog methods: `openCreateUserDialog()` (pre-sets `company_id` from `selectedCompanyId`), `saveUser()` (create/update with error handling for duplicate email)
- [x] 3.7 Implement helper methods: `getPlanName()`, `getRoleLabel()`, `getRoleSeverity()`

## 4. Template HTML

- [x] 4.1 Create `central-management.component.html` with page header (title "Gestión Central", subtitle, "Nueva Empresa" button)
- [x] 4.2 Add filters bar: search input, status filter (p-select: Todos/Activos/Inactivos), plan filter (p-select from planOptions)
- [x] 4.3 Add conditional bulk actions bar showing when `selectedCompanies().length > 0` with count, "Activar selección" and "Desactivar selección" buttons
- [x] 4.4 Add companies `p-table` with: `editMode="row"`, `[(selection)]`, `dataKey="id"`, pagination, `pEditableRow` on body rows, `p-cellEditor` for Nombre/Slug/Plan columns, `p-tableCheckbox`/`p-tableHeaderCheckbox`, status `p-tag`, action buttons (edit/save/cancel row editing, toggle status, view users)
- [x] 4.5 Add `selected-row` CSS class on company row when `selectedCompanyId() === company.id` for visual highlight
- [x] 4.6 Add `(click)="selectCompany(company)"` on company rows for panel selection
- [x] 4.7 Add conditional users panel (`@if (selectedCompanyId())`) with: panel header showing company name + user count + "Nuevo Usuario" button, bulk actions bar for users, users `p-table` with row editing, `p-cellEditor` for Nombre/Rol columns, email read-only, status `p-tag`, action buttons
- [x] 4.8 Add user bulk actions bar showing when `selectedUsers().length > 0`
- [x] 4.9 Add empty states for both tables (with/without filters active)
- [x] 4.10 Add loading skeletons for companies table
- [x] 4.11 Add company create dialog (`p-dialog`) with fields: Nombre, Slug, Dirección, Teléfono, Plan
- [x] 4.12 Add user create dialog (`p-dialog`) with fields: Email, Nombre completo, Teléfono, Rol
- [x] 4.13 Add `p-confirmDialog` and `p-toast` at bottom of template

## 5. Styles

- [x] 5.1 Create `central-management.component.scss` following project design tokens (var(--color-*), var(--space-*), var(--radius-*), var(--font-*))
- [x] 5.2 Style page layout: `.management-page` with padding, max-width, animation
- [x] 5.3 Style page header with `.header-badge`, `.header-text h1/p` matching existing superadmin pages
- [x] 5.4 Style filters bar: flex layout, responsive stacking on mobile
- [x] 5.5 Style bulk actions bar: sage-pale background, flex between count and buttons
- [x] 5.6 Style companies table rows: `.company-row` with cursor pointer, `.selected-row` with sage-pale background + left border
- [x] 5.7 Style existing display classes: `.company-name`, `.slug-code`, `.plan-badge`, `.user-name`, `.user-email`
- [x] 5.8 Style action buttons container
- [x] 5.9 Style users panel: `.users-panel` with border, shadow, sage-pale border, `slideDown` animation; `.panel-header` with icon + title + count badge
- [x] 5.10 Style form grids for both dialogs
- [x] 5.11 Add PrimeNG overrides: `:host ::ng-deep` for `.p-datatable` (header, body rows, editing row highlight, checkbox styles), `.p-tag`, `.p-paginator`
- [x] 5.12 Add responsive breakpoint at `max-width: 768px`

## 6. Verification & Cleanup

- [x] 6.1 Verify the app compiles without errors: `cd app-web && npx ng build --configuration=development`
- [ ] 6.2 Manually test: navigate to `/sa/management`, verify companies table loads with data
- [ ] 6.3 Manually test: row editing on companies — click edit, modify name/slug/plan, save, cancel
- [ ] 6.4 Manually test: click a company row, verify users panel appears with filtered users
- [ ] 6.5 Manually test: row editing on users — click edit, modify name/role, save, cancel
- [ ] 6.6 Manually test: activate/deactivate individual company and user
- [ ] 6.7 Manually test: checkbox selection and bulk activate/deactivate for both tables
- [ ] 6.8 Manually test: filters (search, status, plan) work on companies table
- [ ] 6.9 Manually test: create company and create user dialogs
- [ ] 6.10 Manually test: `/sa` redirects to `/sa/management`, sidebar shows 3 items
- [x] 6.11 Delete old component directories: `rm -rf app-web/src/app/features/backoffice/superadmin/companies/` and `rm -rf app-web/src/app/features/backoffice/superadmin/users/`
- [x] 6.12 Verify app still compiles after deletion