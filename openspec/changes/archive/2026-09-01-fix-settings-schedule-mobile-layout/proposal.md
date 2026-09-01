## Why

On mobile (≤480px), the "Horario del Local" schedule configuration in the manager settings page (`/bo/settings`) is broken: the start and end time inputs of each day overlap in the same CSS grid cell, so only one time is visible and users cannot see or edit the end time. The layout was broken by a later generic backoffice CSS fix (`16a38f2`) and needs a targeted, per-day stacked layout.

## What Changes

- Fix `.schedule-row` mobile (≤480px) CSS so start and end time inputs do not overlap: each day renders as a compact 2-row area (day name + toggle, then the two time inputs side by side with "Apertura"/"Cierre" captions).
- Fix `.time-error` grid placement on mobile so the "Hora inválida" message is visible within the row (currently it overflows off-viewport via implicit grid columns).
- Add accessible labels (`aria-label`) to the time inputs for each day.
- No behavior/API changes: validation logic, save flow, and ScheduleService calls remain identical.

## Capabilities

### New Capabilities
- `manager-settings-mobile-schedule`: Mobile schedule layout for manager settings (per-day stacked rows with visible start/end time inputs and captions).

### Modified Capabilities
- `company-settings`: The "Responsive layout" requirement is updated to make the mobile per-day stacked behavior concrete (no overlapping time inputs, captions visible).

## Impact

- `app-web/src/app/features/backoffice/manager/settings/settings.component.scss` (mobile media queries, `.schedule-row`, `.col-time`, `.time-error`)
- `app-web/src/app/features/backoffice/manager/settings/settings.component.html` (captions/aria-labels on time inputs)
- `app-web/src/app/features/backoffice/manager/settings/settings.component.ts` (no logic changes expected)
