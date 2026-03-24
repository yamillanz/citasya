## 1. Database Migration

- [x] 1.1 Add `is_active` column to `companies` table (default: true)
- [x] 1.2 Add `is_active` column to `plans` table (default: true)
- [x] 1.3 Verify columns exist and set defaults for existing records

## 2. Model Updates

- [x] 2.1 Update `Company` model to include `is_active: boolean`
- [x] 2.2 Update `CreateCompanyDto` to include optional `is_active`
- [x] 2.3 Update `Plan` model to include `is_active: boolean`

## 3. Service Updates

- [x] 3.1 Update `CompanyService` with `getAll()` method returning all companies with plan info
- [x] 3.2 Update `CompanyService` with `deactivate(id)` and `activate(id)` methods
- [x] 3.3 Update `UserService` with `getAll()` method returning all users
- [x] 3.4 Update `UserService` with `getAllByCompany(companyId)` method
- [x] 3.5 Update `UserService` with `deactivate(id)` and `activate(id)` methods
- [x] 3.6 Create `PlanService` with `getAll()`, `create()`, `update()`, `deactivate()`, `activate()` methods

## 4. Superadmin Layout

- [x] 4.1 Create `superadmin-layout.component.ts` with sidebar navigation
- [x] 4.2 Create `superadmin-layout.component.html` template
- [x] 4.3 Create `superadmin-layout.component.scss` styles
- [x] 4.4 Add routes: `/sa` (redirect to `/sa/companies`), `/sa/companies`, `/sa/users`, `/sa/plans`
- [x] 4.5 Apply `superadminGuard` to all `/sa/*` routes

## 5. Companies Feature (`/sa/companies`)

- [x] 5.1 Create `companies/superadmin-companies.component.ts` with table and filters
- [x] 5.2 Create `companies/superadmin-companies.component.html` template
- [x] 5.3 Create `companies/superadmin-companies.component.scss` styles
- [x] 5.4 Create inline form in component (not separate component)
- [x] 5.5 Create form template inline in component
- [x] 5.6 Implement search by name/slug
- [x] 5.7 Implement pagination (10 per page)
- [x] 5.8 Implement deactivate/reactivate with confirmation dialog
- [x] 5.9 Add status badges (green for active, gray for inactive)

## 6. Users Feature (`/sa/users`)

- [x] 6.1 Create `users/superadmin-users.component.ts` with table and filters
- [x] 6.2 Create `users/superadmin-users.component.html` template
- [x] 6.3 Create `users/superadmin-users.component.scss` styles
- [x] 6.4 Create inline form in component (not separate component)
- [x] 6.5 Create form template inline in component
- [x] 6.6 Implement search by name/email
- [x] 6.7 Implement company filter dropdown
- [x] 6.8 Implement pagination (10 per page)
- [x] 6.9 Implement deactivate/reactivate with confirmation dialog
- [x] 6.10 Add role badges (blue for manager, teal for employee, purple for superadmin)

## 7. Plans Feature (`/sa/plans`)

- [x] 7.1 Create `plans/superadmin-plans.component.ts` with table
- [x] 7.2 Create `plans/superadmin-plans.component.html` template
- [x] 7.3 Create `plans/superadmin-plans.component.scss` styles
- [x] 7.4 Create inline form in component (not separate component)
- [x] 7.5 Create form template inline in component
- [x] 7.6 Implement search by name
- [x] 7.7 Implement deactivate/reactivate with confirmation dialog
- [x] 7.8 Add status badges (green for active, gray for inactive)
- [x] 7.9 Ensure inactive plans are disabled in company form dropdown

## 8. Routing

- [x] 8.1 Create `superadmin.routes.ts` with child routes for each feature
- [x] 8.2 Add `/sa/*` route in `app.routes.ts` with `superadminGuard`
- [x] 8.3 Configure lazy loading for superadmin module

## 9. Verification

- [x] 9.1 Run build to verify compilation
- [ ] 9.2 Test company CRUD operations (requires running app)
- [ ] 9.3 Test user CRUD operations (requires running app)
- [ ] 9.4 Test plan CRUD operations (requires running app)
- [ ] 9.5 Verify plan assignment to companies works (requires running app)
- [ ] 9.6 Verify guard blocks non-superadmin users (requires running app)
