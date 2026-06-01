## ADDED Requirements

### Requirement: Separator between manager and employee menu groups

The system SHALL render a discreet text separator "Empleado" between the manager menu items and the employee menu items when both groups are present in the backoffice sidebar.

The separator:
- SHALL NOT be a clickable navigation item
- SHALL NOT have an icon or routerLink
- SHALL have a font size no larger than 11px (0.6875rem)
- SHALL be visually distinct from regular nav items (muted color, no hover/focus background)
- SHALL NOT appear when only manager items are shown (`user.can_be_employee` is false)
- SHALL NOT affect the employee-only view in `EmployeeLayoutComponent`
- SHALL render identically in both desktop sidebar and mobile sidebar

#### Scenario: Mixed-role user sees separator between groups
- **WHEN** a user with `role=manager` and `can_be_employee=true` views the backoffice sidebar
- **THEN** the menu SHALL display manager items first, then the "Empleado" separator, then employee items

#### Scenario: Manager-only user does not see separator
- **WHEN** a user with `role=manager` and `can_be_employee=false` views the backoffice sidebar
- **THEN** the menu SHALL display only manager items with no separator

#### Scenario: Separator renders in mobile sidebar
- **WHEN** a user with `can_be_employee=true` opens the mobile sidebar
- **THEN** the mobile menu SHALL display the same groups with the separator between them

#### Scenario: Separator is not clickable
- **WHEN** a user clicks or taps the separator element
- **THEN** no navigation SHALL occur

#### Scenario: Separator respects max font size
- **WHEN** the separator is rendered
- **THEN** the computed font size SHALL be ≤ 11px
