## Context

The Superadmin role needs a centralized backoffice to manage the entire holacitas platform. This includes:

- **Companies**: All businesses using the platform
- **Users**: Managers and employees across all companies
- **Plans**: Subscription tiers that define platform limits
- **Assignments**: Linking plans to companies, creating users per company

The existing system already has models for Company, User, and Plan, along with base services. The superadmin panel will extend these to provide full CRUD operations across the entire platform.

## Goals / Non-Goals

**Goals:**
- Provide a unified superadmin interface at `/sa/*`
- Enable CRUD operations for companies, users, and plans
- Support plan-to-company assignments
- Maintain consistent UI patterns with existing manager/employee backoffice

**Non-Goals:**
- Modifying the public booking flow
- Implementing billing/payment processing (future phase)
- Detailed analytics/reporting (future phase)
- Email/notification management (future phase)

## Decisions

### 1. Route Structure
Routes under `/sa/*` with `superadminGuard` protecting all routes:
- `/sa` - Dashboard/overview
- `/sa/companies` - Company management list
- `/sa/companies/new` - Create company
- `/sa/companies/:id` - Edit company
- `/sa/users` - User management list
- `/sa/users/new` - Create user
- `/sa/users/:id` - Edit user
- `/sa/plans` - Plan management list
- `/sa/plans/new` - Create plan
- `/sa/plans/:id` - Edit plan

### 2. Component Architecture
Following existing patterns from `employee-layout` and `manager-layout`:
- `superadmin-layout.component` - Main layout with sidebar navigation
- `companies/` folder - Company list, form components
- `users/` folder - User list, form components
- `plans/` folder - Plan list, form components

### 3. Service Extensions
Extend existing services with superadmin-specific methods:
- `CompanyService`: Add `getAllWithPlan()`, `deactivate(id)`, `activate(id)`
- `UserService`: Add `getAll()`, `getAllByCompany(companyId)`, `deactivate(id)`, `activate(id)`
- `PlanService`: Create new service with `getAll()`, `create()`, `update()`, `deactivate()`, `activate()`

### 4. UI Components (PrimeNG)
- Tables with pagination and filters for lists
- Dialog forms for create/edit
- Dropdowns for plan selection when assigning to companies
- Status badges (active/inactive)
- Confirm dialogs for destructive actions

### 5. Data Model Additions
Company model needs `is_active` field (currently missing):
```typescript
export interface Company {
  // ... existing fields
  is_active: boolean;
}
```

Plan model needs `is_active` field:
```typescript
export interface Plan {
  // ... existing fields
  is_active: boolean;
}
```

User model already has `is_active`.

## Risks / Trade-offs

- **Risk**: Adding `is_active` to existing tables requires migration
  - **Mitigation**: Create migration to add the column if not exists

- **Risk**: No soft-delete pattern currently implemented
  - **Mitigation**: Use `is_active` boolean for soft-delete; don't physically delete records in superadmin CRUD

- **Risk**: Large number of users/companies could slow down tables
  - **Mitigation**: Use PrimeNG table pagination (default 10 per page)

## Migration Plan

1. Create database migration to add `is_active` to companies and plans tables
2. Update existing Company and Plan models with `is_active` field
3. Create superadmin-layout component
4. Create routes under `/sa/*`
5. Implement each CRUD section sequentially (companies → users → plans → assignments)
6. Test each section before moving to next

## Open Questions

- Should superadmin be able to see user passwords or just reset them?
- Do we need audit logging for superadmin actions?
- Should plan changes take effect immediately or have a billing cycle?
