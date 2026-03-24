## Context

Phase 5 completed the Superadmin Backoffice with full CRUD functionality. Now Phase 6 focuses on polish: making the application production-ready with consistent UI/UX, proper error handling, loading states, mobile responsiveness, and testing.

### Current State
- Manager backoffice: Dashboard, Appointments, Client Management, Services, Business Profile
- Employee backoffice: Dashboard, My Appointments, Availability
- Superadmin backoffice: Companies, Users, Plans management
- Booking flow: Public-facing appointment booking

### Constraints
- Must use PrimeNG components exclusively
- Follow Verde Salvia (#9DC183) color scheme
- Angular 20+ with signals for state management
- Standalone components with OnPush change detection

### Stakeholders
- End users (customers booking appointments)
- Business managers and employees
- Superadmins managing the platform

## Goals / Non-Goals

**Goals:**
- Consistent UI/UX across all backoffice sections
- Centralized error handling with PrimeNG Toast service
- Loading skeletons for data tables
- Meaningful empty states with helpful CTAs
- Mobile-responsive layouts (breakpoints at 768px, 1024px)
- Lazy loading for all feature modules
- Unit tests for services using Vitest
- Production build configuration

**Non-Goals:**
- E2E testing (out of scope for this phase)
- Dark mode support
- Internationalization (i18n)
- Performance profiling with Lighthouse CI
- Breaking changes to existing APIs

## Decisions

### 1. Error Handling Strategy
**Decision**: Use PrimeNG `MessageService` (Toast) for global error/success notifications
**Rationale**: PrimeNG provides consistent styling with our existing component library
**Alternative**: Custom toast service → Extra dependency, inconsistent styling

### 2. Loading States
**Decision**: Use PrimeNG `p-skeleton` component for table loading states
**Rationale**: Native PrimeNG component, consistent with UI, easy to implement
**Alternative**: Custom skeleton → More work, inconsistent look

### 3. Empty States
**Decision**: Create reusable empty state component with icon, message, and optional CTA button
**Rationale**: DRY approach, consistent across all tables/views
**Alternative**: Inline empty state per component → Duplication

### 4. Responsive Design
**Decision**: Use PrimeNG's responsive grid and Tailwind breakpoints (768px, 1024px)
**Rationale**: Existing Tailwind setup, minimal additional CSS
**Alternative**: PrimeFlex CSS utility library → Additional dependency

### 5. Service Error Handling
**Decision**: Centralize error handling in services, display via Toast
**Rationale**: Consistent error experience, easier to maintain
**Alternative**: Component-level error handling → Duplication

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Breaking existing functionality during refactoring | Create branch, test thoroughly, rollback plan |
| Performance regression from added features | Use `OnPush` change detection, lazy loading |
| Inconsistent polish implementation | Create shared components for common patterns |
| Test coverage gaps | Focus on service layer tests, critical path only |

## Migration Plan

1. Create `phase-6-polish` branch from `develop`
2. Implement changes incrementally by capability:
   - Error handling service updates
   - Shared components (empty state, loading)
   - Backoffice consistency updates
   - Responsive fixes
   - Unit tests
3. Run `npm run lint` and `npm run typecheck` after each change
4. Test locally on mobile viewport sizes
5. Build production bundle and verify size
6. Merge to `develop` after full verification

## Open Questions

1. Should we add `p-skeleton` to all tables or just the main ones? → Start with main tables, add as needed
2. Do we need a shared Toast configuration? → Yes, centralized setup in app.config.ts
3. Should empty state component be a dialog or inline? → Inline for tables, keep simple
