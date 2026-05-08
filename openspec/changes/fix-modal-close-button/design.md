## Approach

Add a close button (`<button>`) with a `pi pi-times` icon inside each custom header template. The button will call the same close method used by footer buttons (`closeDrawer()` for the status drawer, `closeDialog()` for the employee detail dialog).

### Status Drawer (appointments.component.html)

The current header structure is:
```html
<ng-template pTemplate="header">
  <div class="drawer-header">
    <div class="drawer-icon">...</div>
    <div class="drawer-title">...</div>
  </div>
</ng-template>
```

The `.drawer-header` already uses `display: flex`. We add the close button as a sibling with `margin-left: auto` to push it to the right edge. No layout restructuring needed.

### Employee Detail Dialog (employee-detail-dialog.component.html)

The current header structure is:
```html
<ng-template pTemplate="header">
  <div class="dialog-header">
    <h2>{{ employeeName }}</h2>
    <span class="dialog-subtitle">...</span>
  </div>
</ng-template>
```

The `.dialog-header` currently uses `flex-direction: column`. We need to restructure to a row layout with the title/subtitle grouped on the left and the close button on the right:
```html
<div class="dialog-header">
  <div class="dialog-header-text">
    <h2>{{ employeeName }}</h2>
    <span class="dialog-subtitle">...</span>
  </div>
  <button class="dialog-close-btn" (click)="closeDialog()">
    <i class="pi pi-times"></i>
  </button>
</div>
```

### Styling

- **Status drawer**: Styles go in `styles.scss` (global) because `p-drawer` renders in `<body>` outside the component tree.
- **Employee detail dialog**: Styles go in the component's `.scss` file because `p-dialog` with the custom header template renders the header content within the component's DOM scope.

### Alternatives Considered

1. **Remove custom header, use `[header]` string**: Rejected because custom headers contain rich content (icons, titles, subtitles) that can't be expressed as a string.
2. **Use `[showCloseIcon]="true"`**: Rejected because this property has no effect when a custom header template is provided — PrimeNG replaces the entire header DOM structure.
