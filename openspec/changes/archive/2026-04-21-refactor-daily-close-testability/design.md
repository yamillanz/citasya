## Context

The DailyCloseComponent currently handles both UI presentation and business logic concerns. This violates the Single Responsibility Principle and makes testing difficult. The component directly interacts with:
- HTTP services for API calls
- PrimeNG confirmation dialogs
- State management for appointments
- Error handling and user notifications

Current test coverage is low because:
- Tight coupling makes mocking difficult
- Business logic is intertwined with UI logic
- No clear separation of concerns

## Goals / Non-Goals

**Goals:**
- Extract all business logic into a dedicated DailyCloseFacade service
- Create interface abstractions for external dependencies (confirmation dialogs)
- Implement Command pattern for appointment actions
- Achieve >95% test coverage on the refactored component
- Follow SOLID principles throughout
- Maintain existing component API to avoid breaking changes
- Keep PrimeNG as the UI component library per project standards

**Non-Goals:**
- Changing the UI design or user experience
- Adding new features to daily close functionality
- Refactoring other components
- Migrating to a different UI library
- Implementing full undo/redo system (only command structure for future use)

## Decisions

### D1: Use Facade Pattern for Business Logic
**Decision:** Create DailyCloseFacade to aggregate all business logic

**Rationale:**
- Provides single entry point for component operations
- Encapsulates complex state management
- Makes component tests simpler - only need to mock one service
- Follows Angular best practices for state management

**Alternatives Considered:**
- *NgRx Store*: Overkill for this single component; adds complexity
- *Direct Service Calls*: Would scatter business logic across component methods
- *Repository Pattern*: Good for data access but doesn't cover all business operations

### D2: Interface-Based Confirmation Dialog
**Decision:** Create IConfirmationDialog interface with PrimeNG and mock implementations

**Rationale:**
- Allows complete mock control in tests
- No need for TestBed integration testing for simple dialog flows
- Makes dialog responses deterministic in tests

**Alternatives Considered:**
- *Spy on PrimeNG directly*: Fragile, tied to implementation details
- *Use Angular TestBed harnesses*: More complex, slower tests

### D3: Command Pattern for Actions
**Decision:** Implement Command pattern in AppointmentActionService

**Rationale:**
- Encapsulates each operation with its parameters
- Enables future undo/redo functionality
- Makes operations easier to test in isolation
- Supports batch operations naturally

**Alternatives Considered:**
- *Direct method calls*: Simpler but less extensible
- *Event-driven approach*: More complex for this use case

### D4: Signal-Based State Management
**Decision:** Use Angular signals (signal(), computed()) for all state

**Rationale:**
- Native Angular 17.2+ feature
- Works seamlessly with OnPush change detection
- Readable and writable signal separation
- Better performance than Zone.js-based detection

**Alternatives Considered:**
- *RxJS BehaviorSubjects*: More verbose, requires async pipes
- *NgRx Signals*: External dependency, not needed for simple state

### D5: Keep PrimeNG Components
**Decision:** Continue using PrimeNG for all UI components

**Rationale:**
- Project standard (per AGENTS.md)
- Rich component set with good accessibility
- Built-in theming support

## Risks / Trade-offs

**[Risk] Regression in existing functionality**
→ Mitigation: Comprehensive test suite with >95% coverage before refactoring; maintain exact same component inputs/outputs

**[Risk] Increased complexity from abstraction layers**
→ Mitigation: Keep interfaces simple; only abstract what's needed for testing; clear documentation

**[Risk] Learning curve for new patterns**
→ Mitigation: Document patterns in code comments; provide examples in tests

**[Risk] Performance impact from additional service layer**
→ Mitigation: Services are lightweight; signals are performant; measure before/after

**[Trade-off] More files to maintain**
The refactoring creates more files (facade, interfaces, commands) but each has a single responsibility and is easier to test and maintain.

## Migration Plan

### Phase 1: Create Services (No UI changes)
1. Create DailyCloseFacade with basic structure
2. Create IConfirmationDialog interface
3. Create PrimeNGConfirmationDialog implementation
4. Create AppointmentActionService with commands

### Phase 2: Refactor Component
1. Update DailyCloseComponent to use facade
2. Remove business logic from component
3. Update template bindings to use signals
4. Add IConfirmationDialog injection

### Phase 3: Rewrite Tests
1. Create MockConfirmationDialog for tests
2. Write comprehensive unit tests for facade
3. Write unit tests for command service
4. Rewrite component tests with proper mocking
5. Verify >95% coverage

### Phase 4: Validation
1. Manual testing of all user flows
2. Verify no console errors
3. Performance comparison
4. Code review for pattern consistency

### Rollback Strategy
- All changes are additive (new services)
- Component can be reverted to previous version if needed
- Keep feature branch until validation complete

## Open Questions

1. **Q:** Should we implement full undo/redo or just command structure?
   **A:** Start with command structure only; undo can be added later if needed

2. **Q:** How to handle loading states during batch operations?
   **A:** Expose granular loading signals per operation plus overall loading state

3. **Q:** Should the facade handle caching of appointment data?
   **A:** Not in this iteration; add if performance testing shows need

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    DailyCloseComponent                       │
│                      (UI Layer)                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  - Template bindings (signals)                       │  │
│  │  - Event handlers                                    │  │
│  │  - PrimeNG components                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │ inject()
              ┌───────────┴───────────┐
              ▼                       ▼
┌─────────────────────────┐ ┌─────────────────────────────────┐
│   DailyCloseFacade      │ │   IConfirmationDialog           │
│   (Business Logic)      │ │   (Interface)                   │
│                         │ │                                 │
│  - State management     │ │  ┌───────────────────────────┐  │
│  - API coordination     │ │  │PrimeNGConfirmationDialog  │  │
│  - Validation logic     │ │  │(Production Implementation)│  │
└───────────┬─────────────┘ │  └───────────────────────────┘  │
            │               │                                 │
            │               │  ┌───────────────────────────┐  │
            │               │  │MockConfirmationDialog     │  │
            │               │  │(Test Implementation)      │  │
            │               │  └───────────────────────────┘  │
            │               └─────────────────────────────────┘
            │ inject()
            ▼
┌──────────────────────────────────┐
│  AppointmentActionService        │
│  (Command Pattern)               │
│                                  │
│  - StatusChangeCommand           │
│  - CloseDayCommand               │
│  - Batch execution               │
└──────────────────────────────────┘
```
