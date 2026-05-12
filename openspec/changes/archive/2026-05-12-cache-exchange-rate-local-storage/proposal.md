## Why

Al completar una cita, el manager debe ingresar manualmente la tasa de cambio cada vez. Como la tasa cambia con poca frecuencia (diaria o semanal), repetirla en cada cita es tedioso y propenso a errores de tipeo. Se necesita recordar la última tasa utilizada para precargarla automáticamente.

## What Changes

- Crear un servicio `ExchangeRateStorageService` que persista la última tasa de cambio en `localStorage` bajo la key `citasya_exchange_rate`.
- Al abrir el drawer de completar cita (Appointments y Daily Close), precargar la tasa desde localStorage en lugar de defaultear a 1.
- Al confirmar exitosamente una cita completada, actualizar localStorage con la tasa ingresada.
- El cálculo automático de bolívares se dispara al precargar la tasa si ya hay un monto USD ingresado.
- Valor por defecto: 1 (cuando no hay valor previo en localStorage).

## Capabilities

### New Capabilities
- `exchange-rate-cache`: Persistencia y recuperación de la tasa de cambio desde localStorage con validación, manejo de errores y signal reactivo.

### Modified Capabilities
- `appointment-management`: Precarga de tasa de cambio desde cache al abrir drawer de completar cita; actualización del cache al confirmar.
- `daily-close-workbench`: Precarga de tasa de cambio desde cache al abrir drawer de completar cita; actualización del cache al confirmar.

## Impact

- **Nuevo archivo**: `app-web/src/app/core/services/exchange-rate-storage.service.ts` (servicio) y su spec de tests.
- **Modificados**: `appointments.component.ts`, `daily-close.component.ts` (inyección del servicio, precarga y actualización de tasa).
- **Modificado**: `app-web/src/app/core/services/index.ts` (export del nuevo servicio).
- **Sin cambios en BD**: La tasa se almacena exclusivamente en localStorage del navegador, no en Supabase.
- **Sin cambios en API**: No hay endpoints nuevos ni modificaciones al backend.