## Proposal: Fix Duplicate Toasts Across the Application

### Intent
Eliminate duplicate toast notifications caused by multiple `<p-toast>` components subscribing to the global `MessageService` singleton. Centralize toast rendering to layout-level components only.

### Problem Statement
`MessageService` is configured as a global singleton in `app.config.ts`. However, numerous child components (pages, dialogs, forms) declare their own `<p-toast>` elements. When any component calls `messageService.add()`, PrimeNG broadcasts to all active `<p-toast>` instances in the DOM, causing the same message to appear 2–4 times.

### Affected Areas
- **Employee area**: `/emp/calendar` shows 4 simultaneous `<p-toast>` elements (layout + page + 2 dialogs)
- **Manager area**: Multiple pages and forms with local `<p-toast>`
- **Superadmin area**: Plans and central-management pages with local `<p-toast>`
- **Landing**: Contact page with local `<p-toast>`

### Proposed Solution
1. **Remove** all `<p-toast>` declarations from child components (pages, dialogs, forms, tables)
2. **Remove** all local `providers: [MessageService]` from child components
3. **Keep** exactly one `<p-toast>` per root layout:
   - `backoffice.component.html`
   - `employee-layout.component.html`
   - `superadmin-layout.component.html`
4. **Verify** globally that no stray `<p-toast>` or local `MessageService` providers remain

### Success Criteria
- Any action in `/emp/calendar` displays exactly one toast
- `grep -r "<p-toast"` returns only 3 layout files
- `grep -r "providers:.*MessageService"` returns empty
- No visual or behavioral regressions in toast positioning

### Risks & Mitigations
- **Risk**: Some child components relied on a specific `position` attribute.
  - *Mitigation*: Layout-level toasts will use default `top-right` or existing layout configuration.
- **Risk**: Some child components used `providers: [MessageService]` to isolate messages.
  - *Mitigation*: None found in analysis; all local providers appear accidental rather than intentional isolation.

### Scope
- **In**: All `<p-toast>` removals from child components, removal of local `MessageService` providers, layout verification
- **Out**: Changes to `ToastService` logic, `MessageService` global configuration, or toast styling
