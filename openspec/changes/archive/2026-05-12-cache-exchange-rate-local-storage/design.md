## Context

The CitasYa app allows managers to complete appointments by entering a USD amount and an exchange rate to calculate the amount in Bolívares. Currently, the exchange rate defaults to 1 every time a completion drawer is opened, forcing the manager to retype the same rate for each appointment of the day. The rate changes infrequently (daily or weekly), making this repetitive and error-prone.

The completion flow exists in two places:
- `AppointmentsComponent` (at `/bo/appointments`) — uses Angular signals, has `openStatusDialog()` that resets `exchangeRate` to 1
- `DailyCloseComponent` (at `/bo/close`) — uses plain properties, has `openCompleteDrawer()` that resets `exchangeRate` to 1

Both have identical bidirectional calculation logic (`onUsdChange`, `onRateChange`, `onBsChange`).

## Goals / Non-Goals

**Goals:**
- Persist the last used exchange rate in localStorage so it survives across drawer openings within the same session
- Precarga the cached rate when opening the completion drawer in both pages
- Update the cache when the manager successfully completes an appointment
- Handle localStorage unavailability gracefully

**Non-Goals:**
- Persist the rate in the database (explicitly excluded per user request)
- Refactor the duplicated bidirectional calculation logic (separate concern)
- Synchronize the rate across browser tabs
- Share the rate between different users

## Decisions

### 1. Dedicated service vs. inline localStorage access
**Decision:** Create `ExchangeRateStorageService` in `core/services/`

**Rationale:** SRP, testability (mockable), single source of truth for validation logic and error handling. Both components inject the same singleton service.

**Alternatives considered:**
- Direct `localStorage` calls in components: simpler but untestable, duplicated logic, no consistent validation
- A shared utility function: not injectable, can't hold reactive state

### 2. Signal vs. simple getter
**Decision:** Use `signal<number>` exposed as `rate` (read-only) plus `getRate()` method

**Rationale:** Consistency with the project's signal-based pattern. Enables reactive consumption if needed in the future. The `getRate()` method provides a simple imperative API for components using plain properties.

### 3. When to update localStorage
**Decision:** Only on successful appointment completion (after API call succeeds)

**Rationale:** Prevents saving partial or incorrect rates that the user discarded. Only confirmed, valid rates should be cached.

### 4. closeDrawer behavior in DailyCloseComponent
**Decision:** Reset `exchangeRate` to `exchangeRateStorage.getRate()` (cached value) instead of hardcoded 1

**Rationale:** When a manager opens the drawer, sees the cached rate, then closes without completing, the next drawer opening should still show the same cached rate—not reset to 1.

## Risks / Trade-offs

- **[localStorage unavailable]** → Mitigation: try/catch in service, fallback to default value 1, in-memory signal still works for the session
- **[Rate stored per browser, not per user]** → Acceptable: the user explicitly accepted this trade-off. If multi-device sync is needed later, a DB-backed solution can be added
- **[Duplicate calculation logic not refactored]** → Acceptable: out of scope for this change. The `onUsdChange`/`onRateChange`/`onBsChange` methods remain duplicated but unchanged in behavior