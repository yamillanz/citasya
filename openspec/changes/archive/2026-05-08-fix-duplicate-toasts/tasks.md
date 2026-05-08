## Tasks: Fix Duplicate Toasts

### Task 1: Employee Area Cleanup
- [x] **1.1** Remove `<p-toast>` from `employee-calendar.component.html`
- [x] **1.2** Remove `<p-toast>` from `appointment-create-dialog.component.html`
- [x] **1.3** Remove `<p-toast>` from `appointment-detail-dialog.component.html`
- [x] **1.4** Remove `<p-toast>` from `employee-history.component.html`
- [x] **1.5** Verify `employee-layout.component.html` has exactly one `<p-toast>`
- [x] **1.6** Remove `ToastModule` import from `.ts` files if now unused

### Task 2: Manager Area Cleanup
- [x] **2.1** Remove `<p-toast>` from `appointments.component.html`
- [x] **2.2** Remove `<p-toast>` from `daily-close.component.html`
- [x] **2.3** Remove `<p-toast>` from `services.component.html`
- [x] **2.4** Remove `<p-toast>` from `service-form.component.html`
- [x] **2.5** Remove `<p-toast>` from `employees.component.html`
- [x] **2.6** Remove `<p-toast>` from `employee-form.component.html`
- [x] **2.7** Verify `backoffice.component.html` has exactly one `<p-toast>`
- [x] **2.8** Remove `providers: [MessageService]` and `ToastModule` imports from manager `.ts` files if now unused

### Task 3: Superadmin Area Cleanup
- [x] **3.1** Remove `<p-toast>` from `superadmin-plans.component.html`
- [x] **3.2** Remove `<p-toast>` from `central-management.component.html`
- [x] **3.3** Verify `superadmin-layout.component.html` has exactly one `<p-toast>`
- [x] **3.4** Remove `providers: [MessageService]` and `ToastModule` imports from superadmin `.ts` files if now unused

### Task 4: Landing Cleanup
- [x] **4.1** Remove `<p-toast>` from `contact.component.html`
- [x] **4.2** Remove `providers: [MessageService]` and `ToastModule` imports from `contact.component.ts` if present

### Task 5: Global Verification
- [x] **5.1** Run `grep -rn "<p-toast" src/app` and confirm only 3 layout files match
- [x] **5.2** Run `grep -rn "providers:.*MessageService" src/app` and confirm no matches (except .spec.ts test files)
- [x] **5.3** Run `ng build` and confirm zero compilation errors
- [x] **5.4** Manual smoke test on `/emp/calendar`: trigger toast action and confirm exactly one toast appears

### Acceptance Criteria
- [x] No child component in backoffice or landing declares `<p-toast>`
- [x] No child component declares `providers: [MessageService]`
- [x] Exactly 3 `<p-toast>` remain (one per root layout)
- [x] Application builds successfully
- [x] `/emp/calendar` actions produce a single toast
