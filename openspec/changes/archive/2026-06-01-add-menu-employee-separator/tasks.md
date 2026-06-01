## 1. Modify MenuItem Type and Computed

- [x] 1.1 Extend `MenuItem` interface: make `icon` and `routerLink` optional, add `separator?: boolean`
- [x] 1.2 Update `menuItems` computed to insert `{ label: 'Empleado', separator: true }` between base and employee arrays when `user.can_be_employee` is true

## 2. Update Desktop Sidebar Template

- [x] 2.1 Change `track item.routerLink` to `track $index` in the desktop nav `@for`
- [x] 2.2 Add `@if (item.separator)` branch to render `.nav-separator` div instead of anchor for separator items

## 3. Update Mobile Sidebar Template

- [x] 3.1 Change `track item.routerLink` to `track $index` in the mobile nav `@for`
- [x] 3.2 Add `@if (item.separator)` branch to render `.mobile-nav-separator` div instead of anchor for separator items

## 4. Add Separator Styles

- [x] 4.1 Add `.nav-separator` styles in backoffice.component.scss (flex, ~11px font, muted color, thin line via `::before`)
- [x] 4.2 Add `.mobile-nav-separator` styles with same visual treatment

## 5. Verify

- [x] 5.1 Run `ng build` to check for compilation errors
