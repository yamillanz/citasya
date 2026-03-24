## Why

The Superadmin role requires a dedicated backoffice interface to manage the entire platform. Currently, company managers and employees have their dashboards, but there's no way for a superadmin to manage companies, users, and subscription plans from a central panel.

## What Changes

- Create a new Superadmin Layout with sidebar navigation
- Implement Companies management (`/sa/companies`):
  - List all companies with search/filter
  - Create new companies
  - Edit company details
  - Deactivate/activate companies
- Implement Users management (`/sa/users`):
  - List all users across all companies
  - Create users (manager/employee) for specific companies
  - Edit user details and roles
  - Deactivate/activate users
- Implement Plans management (`/sa/plans`):
  - List all subscription plans
  - Create new plans with features and limits
  - Edit plan details
  - Deactivate/activate plans
- Implement Plan-Company assignment:
  - Assign plans to companies
  - View current plan per company
  - Change company plan

## Capabilities

### New Capabilities

- `superadmin-companies`: Full CRUD interface for managing companies in the platform
- `superadmin-users`: Full CRUD interface for managing users across all companies with role assignment
- `superadmin-plans`: Full CRUD interface for managing subscription plans
- `superadmin-assignments`: Interface for assigning plans to companies and creating users per company

### Modified Capabilities

- `company-directory`: May need to ensure company status (active/inactive) is properly tracked and displayed

## Impact

- New routes under `/sa/*` for superadmin panel
- New services for companies, users, and plans management
- New components for superadmin layout and each management section
- Role-based access control: superadminGuard on all `/sa/*` routes
