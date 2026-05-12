## ADDED Requirements

### Requirement: Preload exchange rate from cache in daily close completion
The system SHALL preload the exchange rate from `ExchangeRateStorageService` when the completion drawer opens in the daily close page, instead of defaulting to 1.

#### Scenario: Drawer opens with cached rate
- **WHEN** the manager opens the completion drawer for an appointment in daily close
- **AND** localStorage contains `citasya_exchange_rate` with value 6.85
- **THEN** the exchange rate field displays 6.85

#### Scenario: Drawer opens with no cached rate
- **WHEN** the manager opens the completion drawer for an appointment in daily close
- **AND** localStorage does not contain `citasya_exchange_rate`
- **THEN** the exchange rate field displays 1

#### Scenario: Closing drawer preserves cached rate for next opening
- **WHEN** the manager closes the completion drawer without completing
- **THEN** the exchange rate resets to the cached value (not 1)

### Requirement: Save exchange rate to cache on successful daily close completion
The system SHALL save the exchange rate to `ExchangeRateStorageService` when an appointment is successfully completed in the daily close page.

#### Scenario: Rate saved after successful completion
- **WHEN** the manager confirms appointment completion with exchange rate 7.05
- **THEN** the system calls `exchangeRateStorage.setRate(7.05)` after the facade call succeeds