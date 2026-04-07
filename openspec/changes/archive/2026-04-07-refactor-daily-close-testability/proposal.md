# Refactor DailyCloseComponent for Improved Testability

## Problem Statement

The `DailyCloseComponent` currently mixes UI concerns with business logic, making it difficult to test effectively. The component handles:
- State management for daily close operations
- Confirmation dialog interactions
- API calls for closing daily operations
- Error handling and loading states

This tight coupling results in:
- Complex test setup requiring spies and mocks for multiple dependencies
- Difficult-to-maintain tests that break when implementation details change
- Low test coverage due to complexity
- Violation of Single Responsibility Principle

## Goals

1. **Extract business logic** into a dedicated `DailyCloseFacade` service following the Facade pattern
2. **Create abstractions** for external dependencies (confirmation dialogs) to enable proper mocking
3. **Make the component UI-only** - responsible only for presentation and user interactions
4. **Achieve >95% test coverage** through simplified, focused unit tests
5. **Follow SOLID principles** for maintainable, extensible code

## Success Criteria

- [ ] `DailyCloseComponent` contains only UI logic (template bindings, event handlers)
- [ ] `DailyCloseFacade` service handles all business logic and state management
- [ ] `IConfirmationDialog` abstraction allows easy mocking in tests
- [ ] Test coverage for component reaches >95%
- [ ] Test coverage for facade reaches >95%
- [ ] All existing functionality preserved
- [ ] Tests run quickly without complex setup

## Out of Scope

- Changes to the daily close API endpoints
- UI redesign or style changes
- Adding new features to daily close functionality
- Integration tests (focus is on unit testability)

## Rollback Plan

If issues are discovered:
1. Revert to the original component implementation
2. Restore original tests
3. The refactoring is additive (new service/abstractions), so rollback is straightforward
