## Specs (Delta): Fix Duplicate Toasts

### Requirements

#### R1: Unique Toast per Layout Area
Each functional area (Employee, Manager, Superadmin) MUST have exactly one active `<p-toast>` component in its root layout template. No child component within that area may declare an additional `<p-toast>`.

#### R2: No Child-Level Toasts
No page, form, dialog, table, or child component within the backoffice or landing areas SHALL declare `<p-toast>` in its template.

#### R3: Global MessageService Usage
All components MUST consume the global `MessageService` instance provided in `app.config.ts`. No child component SHALL declare `providers: [MessageService]` locally.

#### R4: Landing Consistency
The landing area SHALL follow the same rule: either have a single `<p-toast>` in its root layout or remove it from child pages.

### Implementation Rules
- When removing `<p-toast>` from an HTML template, also remove the `ToastModule` import from the corresponding `.ts` file if it is no longer used elsewhere in that component.
- When removing `providers: [MessageService]` from a `.ts` file, ensure the component still injects `MessageService` (via `inject()`) if it calls toast methods; the injection will resolve to the global singleton.
- Do not modify `app.config.ts`.
- Do not modify `ToastService` or `MessageService` source files.

### Verification Checklist
- [ ] `grep -rn "<p-toast" app-web/src/app` returns only 3 lines (one per layout root)
- [ ] `grep -rn "providers:.*MessageService" app-web/src/app` returns nothing
- [ ] Manual test: `/emp/calendar` action produces exactly one toast
- [ ] Application compiles without errors (`ng build`)
