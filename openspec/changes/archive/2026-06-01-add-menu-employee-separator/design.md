## Context

The backoffice sidebar (`BackofficeComponent`) uses a `computed` signal `menuItems` that conditionally merges `baseMenuItems` (manager) and `employeeMenuItems` when `user.can_be_employee` is true. The template iterates over `menuItems()` in two places: the desktop `<nav class="sidebar-nav">` and the mobile `<nav class="mobile-sidebar-nav">`.

Currently both menu groups are concatenated without any visual boundary. The `MenuItem` interface is strict: `{ label: string; icon: string; routerLink: string }`. Separator items do not fit this shape.

## Goals / Non-Goals

**Goals:**
- Add a non-clickable "Empleado" separator between manager and employee items in the mixed-role sidebar
- Style the separator as discreet (max ~11px font, muted color, no hover state)
- Desktop and mobile sidebars must behave identically
- Zero impact on manager-only view, employee-only view, or any other part of the application

**Non-Goals:**
- Not adding generic "section header" or menu grouping infrastructure — just the one separator needed
- Not modifying `EmployeeLayoutComponent` or any other layout
- Not introducing PrimeNG menu components or dynamic menu configuration
- Not changing routes, services, or data models

## Decisions

### Decision 1: Optional `separator` field on `MenuItem` vs. new type
- **Chosen:** Add optional `separator?: boolean` to the existing `MenuItem` interface; make `icon` and `routerLink` optional
- **Alternative:** Create a separate `NavSeparator` type and union `NavItem = MenuItem | NavSeparator`
- **Rationale:** Simple — one boolean flag on the existing type avoids union discrimination in the template. The type change is backward-compatible since all existing items have all fields set.
- **Trade-off:** A cleaner type-safety fan would prefer the union, but the boolean approach is more pragmatic for a single separator.

### Decision 2: `track $index` vs. `track item.routerLink`
- **Chosen:** `track $index`
- **Rationale:** Separator items have no `routerLink`. Using `$index` with static arrays is safe and performant. The menu arrays never reorder during the component lifecycle.
- **Trade-off:** None for static arrays. If dynamic menu reordering were added later, `$index` would cause unnecessary DOM recycling — but that's not a concern here.

### Decision 3: Separator visual style
- **Chosen:** Thin horizontal line + small uppercase muted text ("EMPLEADO")
- **Rationale:** The line provides a clear section boundary; the muted uppercase text follows sidebar conventions for secondary labels (see `.sidebar-badge` at 0.6875rem/11px). The `::before` pseudo-element approach keeps the markup clean with a single `<div>`.
- **Alternatives considered:** Just text without line (less visible), divider-only without text (ambiguous), larger font (violates "discreet" requirement).

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Template logic duplication between desktop and mobile | Both use the exact same pattern; extracting a shared component is over-engineering for two instances |
| Using `track $index` is less robust than a stable identifier | Acceptable since the menu array never changes order or length within a session |
| Separator styling differs from standard nav-item | Intentional — it's not a nav item. Different styling signals non-interactivity |
