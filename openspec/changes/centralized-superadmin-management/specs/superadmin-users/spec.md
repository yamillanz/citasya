# superadmin-users Delta Specification

## REMOVED Requirements

### Requirement: Superadmin can view all users
**Reason**: Replaced by centralized-management users panel at `/sa/management` which shows users of a selected company inline
**Migration**: Navigate to `/sa/management`, select a company, and view its users in the panel below

### Requirement: Superadmin can create a user
**Reason**: Replaced by centralized-management dialog accessible from the users panel
**Migration**: Select a company and click "Nuevo Usuario" in the users panel

### Requirement: Superadmin can edit a user
**Reason**: Replaced by inline row editing in the centralized-management users table
**Migration**: Click edit icon on any user row in the users panel

### Requirement: Superadmin can deactivate/reactivate a user
**Reason**: Replaced by toggle button and bulk actions in centralized-management users table
**Migration**: Use toggle button on each user row or select multiple rows for bulk activate/deactivate

### Requirement: User role is displayed with badge
**Reason**: Replaced by identical role badge rendering in centralized-management users table
**Migration**: View role column in the users panel