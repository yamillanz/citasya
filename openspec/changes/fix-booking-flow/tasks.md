# Tasks: Fix Booking Flow and Auth Lock Error

## Task 1: Fix Supabase Auth Configuration

**Files:**
- Modify: `app-web/src/app/core/supabase.ts`

- [ ] **Step 1: Add auth storage configuration**

```typescript
// Before:
export const supabase = createClient(
  environment.supabaseUrl,
  environment.supabaseAnonKey
);

// After:
export const supabase = createClient(
  environment.supabaseUrl,
  environment.supabaseAnonKey,
  {
    auth: {
      storage: window.localStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  }
);
```

- [ ] **Step 2: Verify no import changes needed**

The `createClient` function should already accept the options object.

- [ ] **Step 3: Test the change**

Run the app and verify no more NavigatorLockAcquireTimeoutError in console.

- [ ] **Step 4: Commit**

```bash
git add app-web/src/app/core/supabase.ts
git commit -m "fix: configure Supabase auth storage to prevent NavigatorLockAcquireTimeoutError"
```

---

## Task 2: Fix "Tu Link" Generation in Employee Calendar

**Files:**
- Modify: `app-web/src/app/features/backoffice/employee/calendar/employee-calendar.component.ts`

- [ ] **Step 1: Update link generation**

```typescript
// In copyBookingLink() method, change:
const bookingUrl = `${window.location.origin}/c/${company.slug}/e/${user.id}/book`;

// To:
const bookingUrl = `${window.location.origin}/c/${company.slug}/e/${user.id}`;
```

- [ ] **Step 2: Update success message** (optional but recommended)

```typescript
// Change:
this.messageService.add({
  severity: 'success',
  summary: 'Link copiado',
  detail: 'Link copiado al portapapeles',
  life: 3000
});

// To:
this.messageService.add({
  severity: 'success',
  summary: 'Link copiado',
  detail: 'El cliente podrá ver tu calendario y seleccionar servicio, fecha y hora',
  life: 5000
});
```

- [ ] **Step 3: Test manually**

1. Login as employee
2. Go to calendar
3. Click "Tu link"
4. Paste in new browser tab
5. Verify it goes to `/c/slug/e/empId` (not `/book`)
6. Verify the employee calendar loads correctly

- [ ] **Step 4: Commit**

```bash
git add app-web/src/app/features/backoffice/employee/calendar/employee-calendar.component.ts
git commit -m "fix: point Tu link to public calendar instead of booking form"
```

---

## Task 3: Add Open Mode Support to Booking Form

**Files:**
- Modify: `app-web/src/app/features/public/booking-form/booking-form.component.ts`
- Modify: `app-web/src/app/features/public/booking-form/booking-form.component.html`
- Modify: `app-web/src/app/features/public/booking-form/booking-form.component.scss`

- [ ] **Step 1: Add new signals and imports in TypeScript**

```typescript
// Add Service import if not present:
import { Service } from '../../../core/models/service.model';

// Add new signals:
isOpenMode = signal(false);
services = signal<Service[]>([]);
selectedServiceId = signal<string>('');
availableSlots = signal<{date: string, time: string}[]>([]);

// Add FormGroup for open mode selection:
selectionForm = this.fb.group({
  service_id: ['', Validators.required],
  appointment_date: ['', Validators.required],
  appointment_time: ['', Validators.required]
});
```

- [ ] **Step 2: Update ngOnInit to detect open mode**

```typescript
async ngOnInit() {
  const slug = this.route.snapshot.paramMap.get('companySlug');
  const employeeId = this.route.snapshot.paramMap.get('employeeId');
  
  const serviceId = this.route.snapshot.queryParamMap.get('serviceId');
  const date = this.route.snapshot.queryParamMap.get('date');
  const time = this.route.snapshot.queryParamMap.get('time');

  if (!slug || !employeeId) {
    this.error.set('Parámetros incompletos');
    return;
  }

  try {
    // Load company and employee (always required)
    const [company, employee] = await Promise.all([
      this.companyService.getBySlug(slug),
      this.userService.getById(employeeId)
    ]);

    if (!company || !employee) {
      this.error.set('Datos no encontrados');
      return;
    }

    this.company.set(company);
    this.employee.set(employee);

    // Check mode
    if (serviceId && date && time) {
      // Complete mode - load service
      const service = await this.serviceService.getById(serviceId);
      if (service) {
        this.service.set(service);
        this.selectedDate = date;
        this.selectedTime = time;
      }
    } else {
      // Open mode - load services for this employee
      this.isOpenMode.set(true);
      await this.loadServices(employeeId);
    }
  } catch (err) {
    this.error.set('Error al cargar los datos');
  }
}

async loadServices(employeeId: string) {
  const services = await this.serviceService.getByEmployeeId(employeeId);
  this.services.set(services || []);
}
```

- [ ] **Step 3: Add method to handle service selection in open mode**

```typescript
onServiceChange(event: any) {
  const serviceId = event.value;
  this.selectedServiceId.set(serviceId);
}

async onDateSelect(date: string) {
  this.selectionForm.patchValue({ appointment_date: date });
  // TODO: Load available slots for this date
  // This would require a new method in the service
}

onTimeSelect(time: string) {
  this.selectionForm.patchValue({ appointment_time: time });
}

canProceedFromStep0(): boolean {
  return this.selectionForm.valid;
}

proceedFromStep0() {
  if (!this.canProceedFromStep0()) {
    Object.values(this.selectionForm.controls).forEach(c => c.markAsTouched());
    return;
  }
  
  // Set the selected values
  const service = this.services().find(s => s.id === this.selectionForm.value.service_id);
  if (service) {
    this.service.set(service);
  }
  this.selectedDate = this.selectionForm.value.appointment_date || '';
  this.selectedTime = this.selectionForm.value.appointment_time || '';
  
  // Move to step 1
  this.currentStep.set(1);
}
```

- [ ] **Step 4: Update progress steps in HTML**

Change the progress indicator to show 4 steps when in open mode, or adjust step numbers.

```html
<!-- Before progress-steps div, add condition: -->
@if (isOpenMode()) {
  <!-- Show 4 steps: Seleccionar (0), Resumen (1), Datos (2), Confirmación (3) -->
} @else {
  <!-- Show 3 steps: Resumen (1), Datos (2), Confirmación (3) -->
}
```

- [ ] **Step 5: Add Step 0 (Selection) in HTML**

```html
<!-- Step 0: Service, Date, Time Selection (Open Mode Only) -->
@if (isOpenMode() && currentStep() === 0) {
  <section class="step-section" @fadeInUp>
    <div class="step-card">
      <div class="card-header">
        <h2>Selecciona tu cita</h2>
        <p>Elige el servicio, fecha y hora</p>
      </div>
      
      <form [formGroup]="selectionForm" class="selection-form">
        <!-- Service Selection -->
        <div class="form-field">
          <label for="service_id">
            <i class="pi pi-tag" aria-hidden="true"></i>
            <span>Servicio *</span>
          </label>
          <p-dropdown 
            formControlName="service_id"
            [options]="services()"
            optionLabel="name"
            optionValue="id"
            placeholder="Selecciona un servicio"
            (onChange)="onServiceChange($event)">
          </p-dropdown>
        </div>
        
        <!-- Date Selection -->
        <div class="form-field">
          <label for="appointment_date">
            <i class="pi pi-calendar" aria-hidden="true"></i>
            <span>Fecha *</span>
          </label>
          <p-calendar 
            formControlName="appointment_date"
            [minDate]="minDate"
            (onSelect)="onDateSelect($event)">
          </p-calendar>
        </div>
        
        <!-- Time Selection -->
        <div class="form-field">
          <label for="appointment_time">
            <i class="pi pi-clock" aria-hidden="true"></i>
            <span>Hora *</span>
          </label>
          <p-dropdown 
            formControlName="appointment_time"
            [options]="availableTimeSlots"
            placeholder="Selecciona una hora">
          </p-dropdown>
        </div>
      </form>
      
      <div class="step-actions">
        <button class="btn-primary" (click)="proceedFromStep0()" [disabled]="!canProceedFromStep0()">
          <span>Continuar</span>
          <i class="pi pi-arrow-right"></i>
        </button>
      </div>
    </div>
  </section>
}
```

- [ ] **Step 6: Adjust step numbers for open mode**

When in open mode, step 0 is selection, step 1 is summary (needs adjustment).

- [ ] **Step 7: Add styles for step 0** (if needed)

Add any necessary styles in the SCSS file for the selection form.

- [ ] **Step 8: Test open mode**

1. Navigate directly to `/c/slug/e/empId/book` without query params
2. Verify step 0 shows service, date, time selection
3. Select all fields and click continue
4. Verify step 1 shows correct summary
5. Continue through the flow

- [ ] **Step 9: Commit**

```bash
git add app-web/src/app/features/public/booking-form/
git commit -m "feat: add open mode support to booking form for direct access"
```

---

## Task 4: Update Contact Validation (Email AND/OR Phone)

**Files:**
- Modify: `app-web/src/app/features/public/booking-form/booking-form.component.ts`
- Modify: `app-web/src/app/features/public/booking-form/booking-form.component.html`

- [ ] **Step 1: Add custom validator function**

```typescript
import { FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

function atLeastOneContactValidator(): ValidatorFn {
  return (group: FormGroup): ValidationErrors | null => {
    const phone = group.get('client_phone')?.value;
    const email = group.get('client_email')?.value;
    
    // Remove formatting from phone for length check
    const cleanPhone = phone ? phone.replace(/\D/g, : '';
    
    // At least one must be provided
    if (!cleanPhone && !email) {
      return { noContact: true };
    }
    
    // If phone provided, validate minimum length
    if (cleanPhone && cleanPhone.length < 10) {
      return { invalidPhone: true };
    }
    
    return null;
  };
}
```

- [ ] **Step 2: Update FormGroup with validator**

```typescript
bookingForm = this.fb.group({
  client_name: ['', [Validators.required, Validators.minLength(2)]],
  client_phone: [''],  // Not required - handled by group validator
  client_email: [''],  // Not required - handled by group validator
  notes: ['']
}, { validators: atLeastOneContactValidator() });
```

- [ ] **Step 3: Update phone input to remove required constraint**

Keep the minLength validator for formatting but remove required:

```typescript
// In the form initialization, client_phone doesn't need validators
// The group validator handles the "at least one" logic

// Remove this from template:
// @if (getError('client_phone'))
// Replace with conditional error display
```

- [ ] **Step 4: Add group-level error display in HTML**

```html
<!-- After the email field, before the notes field -->
@if (bookingForm.errors?.['noContact'] && bookingForm.get('client_phone')?.touched && bookingForm.get('client_email')?.touched) {
  <div class="field-error group-error" @shakeError>
    <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
    Debes ingresar al menos un teléfono o email
  </div>
}

@if (bookingForm.errors?.['invalidPhone']) {
  <div class="field-error group-error" @shakeError>
    <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
    El teléfono debe tener al menos 10 dígitos
  </div>
}
```

- [ ] **Step 5: Update labels in HTML**

```html
<!-- Change phone label from "Teléfono *" to "Teléfono" -->
<label for="client_phone">
  <i class="pi pi-phone" aria-hidden="true"></i>
  <span>Teléfono</span>
</label>

<!-- Change email label from "Email (opcional)" to "Email" -->
<label for="client_email">
  <i class="pi pi-envelope" aria-hidden="true"></i>
  <span>Email</span>
</label>

<!-- Add helper text -->
<p class="field-hint">Ingresa al menos un teléfono o email para contactarte</p>
```

- [ ] **Step 6: Update error handling in onSubmit**

```typescript
async onSubmit() {
  // Mark all fields as touched to show validation errors
  Object.values(this.bookingForm.controls).forEach(control => {
    control.markAsTouched();
  });
  
  // Check for group-level errors
  if (this.bookingForm.errors?.['noContact']) {
    this.submitError.set('Debes ingresar al menos un teléfono o email');
    return;
  }
  
  if (this.bookingForm.invalid) {
    return;
  }
  
  // Continue with submission...
}
```

- [ ] **Step 7: Test validation scenarios**

1. Submit with both empty → Shows "at least one" error
2. Submit with only phone (valid) → Works
3. Submit with only email (valid) → Works
4. Submit with both (valid) → Works
5. Submit with invalid phone (less than 10 digits) → Shows phone error
6. Submit with invalid email format → Shows email error

- [ ] **Step 8: Commit**

```bash
git add app-web/src/app/features/public/booking-form/
git commit -m "fix: change contact validation to require email OR phone (at least one)"
```

---

## Task 5: Add Service Method for Employee Services

**Files:**
- Modify: `app-web/src/app/core/services/service.service.ts` (if method doesn't exist)

- [ ] **Step 1: Add method to fetch services by employee ID**

```typescript
async getByEmployeeId(employeeId: string): Promise<Service[] | null> {
  const { data, error } = await this.supabase
    .from('services')
    .select(`
      *,
      employee_services!inner(employee_id)
    `)
    .eq('employee_services.employee_id', employeeId)
    .eq('is_active', true);
  
  if (error) {
    console.error('Error fetching employee services:', error);
    return null;
  }
  
  return data;
}
```

**Note:** This assumes a junction table `employee_services` exists. Adjust the query based on your actual schema.

- [ ] **Step 2: Test the method**

Verify it returns the correct services for an employee.

- [ ] **Step 3: Commit**

```bash
git add app-web/src/app/core/services/service.service.ts
git commit -m "feat: add getByEmployeeId method to service service"
```

---

## Task 6: Final Integration Testing

- [ ] **Step 1: Test complete flow with query params**

1. Navigate from employee calendar to booking form with all params
2. Verify summary (step 1) shows correct data
3. Verify form (step 2) validates correctly
4. Complete booking

- [ ] **Step 2: Test open mode flow**

1. Navigate directly to `/c/slug/e/empId/book`
2. Verify step 0 shows service/date/time selection
3. Complete selection and proceed
4. Verify summary shows selected values
5. Complete booking

- [ ] **Step 3: Test "Tu link" from employee calendar**

1. Login as employee
2. Copy "Tu link"
3. Open in new browser/private window
4. Verify it shows the public employee calendar
5. Select service, date, time
6. Proceed to booking
7. Complete booking

- [ ] **Step 4: Test Supabase Auth fix**

1. Verify no NavigatorLockAcquireTimeoutError in console
2. Test auth flows (login, logout, session persistence)

---

## Summary

Total: 6 tasks with 24 steps

1. Fix Supabase Auth Configuration (4 steps)
2. Fix "Tu Link" Generation (4 steps)
3. Add Open Mode Support (9 steps)
4. Update Contact Validation (8 steps)
5. Add Service Method (3 steps)
6. Final Integration Testing (4 steps)