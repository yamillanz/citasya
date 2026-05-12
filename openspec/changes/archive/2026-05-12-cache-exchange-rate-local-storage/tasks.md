## Tasks

- [x] Create `ExchangeRateStorageService` with signal, localStorage read/write, validation, and error handling (`app-web/src/app/core/services/exchange-rate-storage.service.ts`)
- [x] Create unit tests for `ExchangeRateStorageService` (`app-web/src/app/core/services/exchange-rate-storage.service.spec.ts`)
- [x] Export `ExchangeRateStorageService` from `app-web/src/app/core/services/index.ts`
- [x] Integrate `ExchangeRateStorageService` in `AppointmentsComponent` — precargar tasa en `openStatusDialog()`, guardar tasa en `updateStatus()` tras éxito (`app-web/src/app/features/backoffice/manager/appointments/appointments.component.ts`)
- [x] Integrate `ExchangeRateStorageService` in `DailyCloseComponent` — precargar tasa en `openCompleteDrawer()` y `closeDrawer()`, guardar tasa en `confirmCompletion()` tras éxito (`app-web/src/app/features/backoffice/manager/daily-close/daily-close.component.ts`)
- [x] Verify build passes (`ng build`) and unit tests pass