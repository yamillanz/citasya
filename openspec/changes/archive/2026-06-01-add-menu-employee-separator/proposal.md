## Why

When a manager also has employee role (`can_be_employee = true`), the backoffice sidebar shows both manager and employee menu items concatenated without any visual separation. This makes it unclear where the manager section ends and the employee section begins, causing cognitive friction.

Adding a discreet "Empleado" separator between the two groups provides a clear visual boundary, improving navigation clarity for hybrid-role users.

## What Changes

- Add an optional `separator` field to the `MenuItem` interface to support non-clickable separator items
- Insert a `{ label: 'Empleado', separator: true }` item between the base (manager) and employee menu arrays when `user.can_be_employee` is true
- Update both desktop and mobile sidebar nav templates to render separator items differently from nav links
- Add SCSS styles for the separator rendering (max ~11px font size, discreet visual treatment)

No behavioral changes for manager-only or employee-only views. No changes to routes, services, or data models.

## Capabilities

### New Capabilities
- `menu-employee-separator`: Visual separator between manager and employee menu groups in the backoffice sidebar, only shown when both groups are present

### Modified Capabilities
(none)

## Impact

- **3 files** in `app-web/src/app/features/backoffice/`:
  - `backoffice.component.ts` — extend `MenuItem` interface, update `menuItems` computed
  - `backoffice.component.html` — update desktop and mobile nav loops with separator branch
  - `backoffice.component.scss` — add `.nav-separator` and `.mobile-nav-separator` styles
- No impact on routes, services, models, or other components
- `EmployeeLayoutComponent` is unaffected
