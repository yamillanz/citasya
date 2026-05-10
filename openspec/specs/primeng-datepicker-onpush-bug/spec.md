# PrimeNG DatePicker + OnPress Bug Pattern

## Problem

When using `p-datepicker` (PrimeNG v20) with `formControlName` and `ChangeDetectionStrategy.OnPush`, the first click on a date does NOT propagate the value to the FormControl. The second click works. This causes:

- "Field is required" validation errors on first click
- Slots/dependent data not loading until the second click
- The FormControl value stays `null` after the first selection

### Root Cause

PrimeNG's `p-datepicker` emits internal navigation events (month change, focus) through `valueChanges` before the actual date selection. With `OnPush` change detection, Angular doesn't flush the FormControl update on the first real selection — it only detects the change on the second click cycle.

Additionally, `FormControl.valueChanges` subscriptions also fire with stale/intermediate values from `p-datepicker`, causing race conditions when loading dependent data (e.g., available time slots).

### Affected Components

- Any component using `p-datepicker` with `formControlName` + `OnPush`
- Any component using `p-select` inside a `p-dialog` with scroll (dropdown positioning issues)
- Any component subscribing to `FormControl.valueChanges` for side effects with PrimeNG components

## Solution

### For DatePicker: Use signal + ngModel instead of formControlName

```typescript
// ❌ BROKEN: formControlName with p-datepicker
form: FormGroup = this.fb.group({
  appointment_date: [null, Validators.required],  // <-- Date | null
});

// <p-datepicker formControlName="appointment_date" ...>
```

```typescript
// ✅ WORKING: Separate signal + ngModel with standalone
selectedDate = signal<Date | null>(null);
dateTouched = signal(false);
dateInvalid = computed(() => this.dateTouched() && !this.selectedDate());

// <p-datepicker
//   [ngModel]="selectedDate()"
//   (onSelect)="onDateSelect($event)"
//   [ngModelOptions]="{standalone: true}"
//   ...>
```

Key points:
1. **Remove `appointment_date` from the FormGroup** — the date is managed by a signal, not the form
2. **Use `[ngModel]` with `{standalone: true}`** instead of `formControlName`
3. **Handle selection via `(onSelect)` event** — fires only on actual date click, not navigation
4. **Track touched state manually** with a `dateTouched` signal
5. **Validate manually** with a computed `dateInvalid()` instead of form validation
6. **On submit**, read from `selectedDate()` and convert to string with `formatDateToStr()`

### For Dependent Data Loading: Use template events, not valueChanges subscriptions

```typescript
// ❌ BROKEN: valueChanges with p-datepicker
this.form.get('appointment_date')!.valueChanges.pipe(
  debounceTime(100),
  distinctUntilChanged(...)
).subscribe(date => { this.loadSlots(date, ...); });

// ❌ BROKEN: effect() reading FormControl.value
effect(() => {
  const date = this.form.get('appointment_date')?.value;  // NOT a signal!
  this.loadSlots(date, ...);
});
```

```typescript
// ✅ WORKING: Template event handlers
onDateSelect(date: Date) {
  this.selectedDate.set(date);
  this.dateTouched.set(true);
  this.form.get('appointment_time')?.reset();
  this.availableSlots.set([]);

  const employeeId = this.form.get('employee_id')?.value;
  const duration = this.totalDuration();
  if (date && duration > 0 && this.companyId() && employeeId) {
    this.loadSlots(date, duration, employeeId);
  }
}
```

### For p-select inside dialogs: Use native buttons/chips instead

When `p-select` is inside a `p-dialog` with content scrolling, the dropdown overlay has positioning issues and can close/reopen on click. Use a time-slots grid with `<button>` elements instead:

```html
<!-- ❌ BROKEN: p-select inside scrollable dialog -->
<p-select formControlName="appointment_time" [options]="availableSlots()" ...>

<!-- ✅ WORKING: Button grid for time slots -->
<div class="time-slots-grid">
  @for (slot of availableSlots(); track slot) {
    <button
      type="button"
      class="time-slot-btn"
      [class.selected]="form.get('appointment_time')?.value === slot"
      (click)="selectTimeSlot(slot)">
      {{ slot }}
    </button>
  }
</div>
```

## Pattern for All PrimeNG Form Controls in OnPush Components

| PrimeNG Component | Safe with formControlName? | Recommended Approach |
|---|---|---|
| `p-inputText` | ✅ Yes | `formControlName` works fine |
| `p-select` (dropdown) | ✅ Yes (outside dialogs) | `formControlName` + `(onChange)` |
| `p-select` (inside dialog) | ⚠️ Dropdown positioning | Use button grid / native select |
| `p-datepicker` | ❌ Broken (double-click) | Signal + `ngModel` + `(onSelect)` |
| `p-checkbox` | ✅ Yes | `[ngModel]` + `(ngModelChange)` with standalone |
| `p-inputNumber` | ✅ Yes | `formControlName` works fine |

## Files Where This Pattern Is Applied

- `app-web/src/app/features/backoffice/manager/appointments/manager-appointment-create-dialog.component.ts` — DatePicker with signal, time slots as button grid
- `app-web/src/app/features/backoffice/employee/calendar/appointment-create-dialog.component.ts` — Original dialog (receives date as input, no p-datepicker needed)