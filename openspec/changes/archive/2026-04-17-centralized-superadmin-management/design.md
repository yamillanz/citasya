# Centralized Superadmin Management — Design Document

## Context

The superadmin panel currently has separate views for companies (`/sa/companies`) and users (`/sa/users`), requiring navigation between pages to manage users of a specific company. Both views use `p-table` with `p-dialog` for CRUD operations but lack inline editing and bulk actions.

Current stack: Angular 20 standalone components, PrimeNG `p-table`, signals for state, Supabase client for data. Services `CompanyService`, `UserService`, `PlanService` are already built and work correctly.

## Goals / Non-Goals

**Goals:**
- Unify company and user management into a single page at `/sa/management`
- Enable inline row editing using PrimeNG `editMode="row"` with `pEditableRow`/`p-cellEditor`
- Add checkbox-based multi-selection with bulk activate/deactivate for both companies and users
- Show users of a selected company in a panel below the companies table
- Add status filter and plan filter to companies table
- Maintain all existing CRUD capabilities (create via dialog, edit via inline, toggle status)

**Non-Goals:**
- Changing the database schema or API contracts
- Implementing inline cell editing (cell-by-cell) — we use row editing instead
- Adding user management without a company context (users always belong to a company)
- Modifying the Plan or Transaction pages
- Adding real-time subscriptions or WebSocket updates

## Decisions

### 1. Panel-based users (Option B) vs expandable rows (Option A)

**Decision:** Panel below companies table (Option B).

**Rationale:** Expandable rows (`expandedrow` template) work well for read-only sub-tables but make row editing awkward because the expanded content competes for vertical space. A panel approach gives the users table full width, clear header, and its own pagination/bulk actions independently.

**Alternative considered:** PrimeNG `expandedrow` with nested `p-table` — rejected because inline editing inside an expanded row feels cramped and the bulk action bar would need to nest inside the expansion.

### 2. Row editing (editMode="row") vs dialog editing

**Decision:** Row editing for simple fields (name, slug, plan, role). Dialog preserved for creation only.

**Rationale:** Superadmins edit simple text/dropdown fields frequently. Row editing eliminates the dialog-open-edit-save cycle for quick changes. Creation still uses dialogs because it requires a clean form. The `pEditableRow` / `pSaveEditableRow` / `pCancelEditableRow` lifecycle handles clone-and-revert automatically, preventing accidental data loss.

### 3. Selection model using `signal<CompanyWithPlan[]>`

**Decision:** Use PrimeNG `p-table` selection via `[(selection)]` binding to a signal array.

**Rationale:** PrimeNG's built-in checkbox selection integrates with `p-tableHeaderCheckbox` and `p-tableCheckbox` seamlessly. Using a signal array allows reactive bulk-action bar visibility (show when `selectedCompanies().length > 0`).

### 4. Route change: `/sa/companies` + `/sa/users` → `/sa/management`

**Decision:** Single route `/sa/management` replacing both previous routes.

**Rationale:** The centralized view makes separate routes unnecessary. Users and companies are managed in context of each other. Old routes will 404 — this is a **BREAKING** change but acceptable because the superadmin panel has no public URLs and no saved bookmarks expected.

### 5. Component structure: single `CentralManagementComponent`

**Decision:** One standalone component with 3 files (ts, html, scss).

**Rationale:** The two tables share filter state, selection state, and the company-user relationship. Splitting into separate components would require service-level communication for the selected company → users panel relationship, adding complexity. ~400-500 lines of TypeScript is manageable in one component.

## Risks / Trade-offs

- **Risk:** Row editing UX on mobile — PrimeNG row editing can be cramped on small screens → **Mitigation:** Use responsive column hiding or suggest landscape orientation
- **Risk:** Bulk deactivate companies with active users could orphan users → **Mitigation:** Confirmation dialog shows count of affected companies; future enhancement could cascade deactivation
- **Risk:** Large company list performance with checkbox selection → **Mitigation:** Pagination limits rows to 10-50 per page, PrimeNG selection only applies to visible page
- **Risk:** Removing old routes breaks any deep links → **Mitigation:** Add a redirect from `/sa/companies` and `/sa/users` to `/sa/management` in a follow-up if needed

## Migration Plan

1. Create `CentralManagementComponent` with all functionality
2. Update `SUPERADMIN_ROUTES` to replace `companies` and `users` routes with `management`
3. Update sidebar menu items in `SuperadminLayoutComponent`
4. Test all functionality on `/sa/management`
5. Remove old `SuperadminCompaniesComponent` and `SuperadminUsersComponent`
6. (Optional) Add redirects from old routes to `/sa/management`

## Open Questions

- None at this time. All decisions are finalized based on user requirements.