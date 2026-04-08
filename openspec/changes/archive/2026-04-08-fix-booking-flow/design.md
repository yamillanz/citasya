# Design: Fix Booking Flow and Auth Lock Error

## Architecture Overview

This fix involves four main changes:
1. Route link correction (1-file change)
2. Booking form enhancement (multi-step form support)
3. Contact field validation (custom validator)
4. Supabase Auth configuration (client setup)

## File Structure

```
app-web/src/app/
├── core/
│   └── supabase.ts                          [MODIFY] - Add auth storage config
├── features/
│   ├── backoffice/
│   │   └── employee/
│   │       └── calendar/
│   │           └── employee-calendar.component.ts  [MODIFY] - Fix link generation
│   └── public/
│       └── booking-form/
│           ├── booking-form.component.ts     [MODIFY] - Add open mode, validation
│           ├── booking-form.component.html   [MODIFY] - Add step 0 for open mode
│           └── booking-form.component.scss   [MODIFY] - Styles for step 0
```

## Technical Approach

### 1. Fix "Tu Link" Generation

**File:** `employee-calendar.component.ts`

Change the generated URL from:
```typescript
const bookingUrl = `${window.location.origin}/c/${company.slug}/e/${user.id}/book`;
```

To:
```typescript
const bookingUrl = `${window.location.origin}/c/${company.slug}/e/${user.id}`;
```

This points to the public employee calendar where users can select service, date, and time before booking.

### 2. Booking Form Open Mode

**File:** `booking-form.component.ts`

Add open mode detection:
```typescript
isOpenMode = signal(false);
services = signal<Service[]>([]);

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

  // Load company and employee (always needed)
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

  // Check if we have all required params for complete mode
  if (serviceId && date && time) {
    // Complete mode - existing flow
    const service = await this.serviceService.getById(serviceId);
    if (service) {
      this.service.set(service);
      this.selectedDate = date;
      this.selectedTime = time;
    }
  } else {
    // Open mode - load services for selection
    this.isOpenMode.set(true);
    await this.loadServices(employeeId);
  }
}

async loadServices(employeeId: string) {
  const services = await this.serviceService.getByEmployeeId(employeeId);
  this.services.set(services || []);
}
```

### 3. Contact Field Validation

**File:** `booking-form.component.ts`

Add custom validator:
```typescript
import { FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

function atLeastOneContactValidator(): ValidatorFn {
  return (group: FormGroup): ValidationErrors | null => {
    const phone = group.get('client_phone')?.value;
    const email = group.get('client_email')?.value;
    
    // At least one must be provided
    if (!phone && !email) {
      return { noContact: true };
    }
    
    // If phone provided, validate format
    if (phone && phone.replace(/\D/g, '').length < 10) {
      return { invalidPhone: true };
    }
    
    // If email provided, validate format (Validators.email handles this)
    return null;
  };
}

// In form definition:
bookingForm = this.fb.group({
  client_name: ['', [Validators.required, Validators.minLength(2)]],
  client_phone: [''],  // Not required individually
  client_email: [''],  // Not required individually
  notes: ['']
}, { validators: atLeastOneContactValidator() });

// Helper for template:
hasContactError(): boolean {
  return this.bookingForm.errors?.['noContact'] && 
         this.bookingForm.get('client_phone')?.touched && 
         this.bookingForm.get('client_email')?.touched;
}
```

### 4. Supabase Auth Configuration

**File:** `supabase.ts`

```typescript
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

This prevents NavigatorLockAcquireTimeoutError by using localStorage instead of the Navigator Lock API.

## Data Flow

### Scenario A: Link from Employee's Calendar (with query params)
```
User navigates: /c/slug/e/empId/book?serviceId=X&date=Y&time=Z
  ↓
Component loads company, employee, service
  ↓
Shows Step 1: Summary (pre-filled)
  ↓
Step 2: Contact form (email AND/OR phone required)
  ↓
Step 3: Confirmation
```

### Scenario B: Direct Access (open mode)
```
User navigates: /c/slug/e/empId/book
  ↓
Component loads company, employee, services
  ↓
isOpenMode = true
  ↓
Shows Step 0: Select service, date, time
  ↓
Step 1: Summary
  ↓
Step 2: Contact form
  ↓
Step 3: Confirmation
```

## Edge Cases

1. **No services available**: Show message "Este profesional no tiene servicios disponibles"
2. **No available slots**: Show message "No hay horarios disponibles para esta fecha"
3. **Both phone and email empty**: Show error "Ingresa al menos un email o teléfono"
4. **Invalid phone format**: Show error "El teléfono debe tener al menos 10 dígitos"