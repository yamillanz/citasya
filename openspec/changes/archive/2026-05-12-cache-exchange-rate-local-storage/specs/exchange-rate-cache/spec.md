## ADDED Requirements

### Requirement: Exchange rate persistence in localStorage
The system SHALL store the last used exchange rate in `localStorage` under the key `citasya_exchange_rate` when the manager successfully completes an appointment.

#### Scenario: Rate saved after successful appointment completion
- **WHEN** a manager completes an appointment with exchange rate 6.85
- **THEN** the system stores `citasya_exchange_rate` with value 6.85 in localStorage

#### Scenario: Rate not saved on invalid value
- **WHEN** a manager completes an appointment with exchange rate 0 or negative
- **THEN** the system does NOT update localStorage with the invalid value

### Requirement: Exchange rate retrieval from localStorage
The system SHALL read the stored exchange rate from localStorage when the component initializes, providing it as the default value instead of 1.

#### Scenario: Stored rate available on initialization
- **WHEN** localStorage contains `citasya_exchange_rate` with value 6.85
- **THEN** `getRate()` returns 6.85

#### Scenario: No stored rate returns default
- **WHEN** localStorage does not contain `citasya_exchange_rate`
- **THEN** `getRate()` returns 1

#### Scenario: Invalid stored value returns default
- **WHEN** localStorage contains an invalid value (NaN, 0, negative)
- **THEN** `getRate()` returns 1

### Requirement: Signal-based reactive rate
The service SHALL expose the exchange rate as a read-only signal (`rate`) for reactive consumption by components.

#### Scenario: Signal reflects stored value
- **WHEN** localStorage has rate 7.05 and the service initializes
- **THEN** `rate()` returns 7.05

#### Scenario: Signal updates when rate is set
- **WHEN** `setRate(8.0)` is called
- **THEN** `rate()` returns 8.0

### Requirement: Graceful localStorage error handling
The system SHALL not throw errors when localStorage is unavailable (private browsing, quota exceeded, etc.).

#### Scenario: localStorage read fails
- **WHEN** localStorage.getItem throws an exception
- **THEN** the service returns the default value 1 without throwing

#### Scenario: localStorage write fails
- **WHEN** localStorage.setItem throws an exception
- **THEN** the service silently ignores the error and the in-memory signal remains updated