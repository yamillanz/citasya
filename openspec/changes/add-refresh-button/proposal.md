## Why

Users of the employee calendar (both public and backoffice views) and the daily close workbench currently have no way to manually refresh data without reloading the entire page. When new appointments come in or data changes on the server, users must navigate away and back to see updated information. A small refresh button provides a quick, intuitive way to reload data in-place.

## What Changes

- Add a small icon-only refresh button (`pi-refresh`) to the **backoffice employee calendar** header, positioned before the "Tu link" button
- Add a small icon-only refresh button (`pi-refresh`) to the **public employee calendar** slots section header, next to the selected date display
- Add a small icon-only refresh button (`pi-refresh`) to the **daily close** date navigation bar, between the "Fecha seleccionada" label and the date picker
- Each refresh button triggers the component's existing data-loading method and shows a spinning animation while loading
- The button is disabled while data is already loading to prevent duplicate requests

## Capabilities

### New Capabilities
- `data-refresh-control`: A small icon button that allows users to manually trigger a data refresh on the current view, with visual feedback (spinning icon) during loading and disabled state to prevent duplicate requests.

### Modified Capabilities
- `employee-calendar`: Add refresh button to the public employee calendar view (slots section header)
- `daily-close-workbench`: Add refresh button to the date navigation bar

## Impact

- **Components modified**: 
  - `app-web/src/app/features/backoffice/employee/calendar/employee-calendar.component.ts/html/scss`
  - `app-web/src/app/features/public/employee-calendar/employee-calendar.component.ts/html/scss`
  - `app-web/src/app/features/backoffice/manager/daily-close/daily-close.component.ts/html/scss`
  - `app-web/src/app/features/backoffice/manager/daily-close/daily-close.facade.ts`
- **No API changes**: Reuses existing data-loading methods
- **No new dependencies**: Uses existing PrimeNG ButtonModule already imported in all components