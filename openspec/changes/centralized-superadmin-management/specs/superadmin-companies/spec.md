# superadmin-companies Delta Specification

## REMOVED Requirements

### Requirement: Superadmin can view all companies
**Reason**: Replaced by centralized-management view at `/sa/management` which shows companies in a unified table with inline editing, filters, and user panel
**Migration**: Navigate to `/sa/management` instead of `/sa/companies`

### Requirement: Superadmin can create a company
**Reason**: Replaced by centralized-management dialog accessible from `/sa/management`
**Migration**: Use "Nueva Empresa" button on the centralized management page

### Requirement: Superadmin can edit a company
**Reason**: Replaced by inline row editing in the centralized-management table
**Migration**: Click edit icon on any company row in the centralized table

### Requirement: Superadmin can deactivate/reactivate a company
**Reason**: Replaced by toggle button and bulk actions in centralized-management table
**Migration**: Use toggle button on each row or select multiple rows for bulk activate/deactivate

### Requirement: Company list shows status indicator
**Reason**: Replaced by status badge in centralized-management table with identical visual styling
**Migration**: View status column in the centralized table