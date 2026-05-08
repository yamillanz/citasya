## 1. Fix Status Drawer Close Button

### 1.1 Add X button to status drawer header

- [x] 1.1.1 Edit `app-web/src/app/features/backoffice/manager/appointments/appointments.component.html`
  - Inside the `<ng-template pTemplate="header">`, after `</div><!-- .drawer-title -->`, add:
    ```html
    <button class="drawer-close-btn" (click)="closeDrawer()" type="button" aria-label="Cerrar drawer">
      <i class="pi pi-times"></i>
    </button>
    ```

### 1.2 Style the status drawer close button

- [x] 1.2.1 Edit `app-web/src/styles.scss`
  - In the `.status-drawer` section (after `.drawer-header` styles, ~line 546), add:
    ```scss
    .status-drawer .drawer-close-btn {
      margin-left: auto;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: var(--radius-md);
      background: transparent;
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: all var(--duration-fast) ease;
      flex-shrink: 0;
    }

    .status-drawer .drawer-close-btn:hover {
      background: var(--color-sage-pale);
      color: var(--color-text-primary);
    }
    ```

### 1.3 Verify status drawer

- [x] 1.3.1 Confirm X button appears in top-right of status drawer header
- [x] 1.3.2 Confirm clicking X closes the drawer and resets state
- [x] 1.3.3 Confirm footer "Cancelar" button still works

## 2. Fix Employee Detail Dialog Close Button

### 2.1 Restructure header and add X button

- [x] 2.1.1 Edit `app-web/src/app/features/backoffice/manager/reports/weekly/employee-detail-dialog.component.html`
  - Wrap `<h2>` and `<span class="dialog-subtitle">` in a new `<div class="dialog-header-text">`
  - Add close button after the text wrapper:
    ```html
    <button class="dialog-close-btn" (click)="closeDialog()" type="button" aria-label="Cerrar dialog">
      <i class="pi pi-times"></i>
    </button>
    ```

### 2.2 Style the employee detail dialog close button

- [x] 2.2.1 Edit `app-web/src/app/features/backoffice/manager/reports/weekly/employee-detail-dialog.component.scss`
  - Update `.dialog-header` to use row layout with `justify-content: space-between` and `align-items: flex-start`
  - Add `.dialog-header-text` with `display: flex; flex-direction: column; gap: var(--space-xs);`
  - Add `.dialog-close-btn` styles (32x32px, border-radius, colors, hover)

### 2.3 Verify employee detail dialog

- [x] 2.3.1 Confirm X button appears in top-right of dialog header
- [x] 2.3.2 Confirm clicking X closes the dialog and emits onClose
- [x] 2.3.3 Confirm footer "Cerrar" button still works
- [x] 2.3.4 Confirm header text (name + subtitle) still displays correctly

## 3. Final Verification

- [x] 3.1 All dialogs use `[closable]="false"` to disable native PrimeNG X button
- [x] 3.2 All dialogs have custom X button with proper close handler
- [x] 3.3 Verified on employee calendar page
