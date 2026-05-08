## Design: Fix Duplicate Toasts

### Design Decisions

**Decision 1: Centralization over Key-based Isolation**
- **Chosen**: Remove child `<p-toast>` instances entirely and rely on a single layout-level `<p-toast>`.
- **Rationale**: The bug is caused by visual duplication (multiple DOM elements listening to the same singleton), not by a need to isolate message contexts. Adding `key` attributes to PrimeNG toasts would add unnecessary complexity and require refactoring every `messageService.add()` call. Centralization is simpler and matches PrimeNG's intended usage pattern with a global `MessageService`.

**Decision 2: Preserve Existing Layout Toast Positions**
- **Chosen**: Do not alter the `position` attribute on the layout-level `<p-toast>` elements.
- **Rationale**: Changing toast positions could surprise users. The layouts currently have their own configuration; we only ensure they are the sole toast providers.

**Decision 3: No Changes to `MessageService` or `ToastService` APIs**
- **Chosen**: Keep all business logic untouched.
- **Rationale**: This is a structural/template fix, not a service-layer fix. The services are correctly designed as singletons.

### Files to Modify

| File | Action | Notes |
|------|--------|-------|
| `employee-calendar.component.html` | Remove `<p-toast>` | Line ~58 |
| `appointment-create-dialog.component.html` | Remove `<p-toast>` | Line ~142 |
| `appointment-detail-dialog.component.html` | Remove `<p-toast>` | Line ~9 |
| `employee-history.component.html` | Remove `<p-toast>` | Line ~2 |
| `appointments.component.html` | Remove `<p-toast>` | Line ~305 |
| `daily-close.component.html` | Remove `<p-toast>` | Line ~356 |
| `services.component.html` | Remove `<p-toast>` | Line ~196 |
| `service-form.component.html` | Remove `<p-toast>` | Line ~197 |
| `employees.component.html` | Remove `<p-toast>` | Line ~168 |
| `employee-form.component.html` | Remove `<p-toast>` | Line ~189 |
| `superadmin-plans.component.html` | Remove `<p-toast>` | Line ~214 |
| `central-management.component.html` | Remove `<p-toast>` | Line ~386 |
| `contact.component.html` | Remove `<p-toast>` | Line ~2 |
| `appointments.component.ts` | Remove `providers: [MessageService]` | If present |
| `superadmin-plans.component.ts` | Remove `providers: [MessageService]` | If present |
| `contact.component.ts` | Remove `providers: [MessageService]` | If present |

### Files to Verify (No Changes Expected)

| File | Expected State |
|------|----------------|
| `backoffice.component.html` | Exactly one `<p-toast>` at line ~120 |
| `employee-layout.component.html` | Exactly one `<p-toast>` at line ~130 |
| `superadmin-layout.component.html` | Exactly one `<p-toast>` at line ~120 |

### Testing Strategy
- Compile the application after all removals.
- Navigate to `/emp/calendar` and trigger an action that shows a toast (e.g., copy link). Confirm exactly one toast appears.
- Run global grep commands to assert no stray `<p-toast>` or local `MessageService` providers remain.
