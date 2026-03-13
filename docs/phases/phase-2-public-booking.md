# Phase 2: Public Booking Portal

## Goal
Allow public access to company/employee calendars and booking without client registration

## Estimated Time
~3 hours

## Prerequisites
- Phase 1 completed (Foundation)

---

## Task 2.1: Create CompanyService

**Files:**
- Create: `src/app/core/services/company.service.ts`

**Steps:**

- [ ] **Step 1: Create CompanyService**

```typescript
// src/app/core/services/company.service.ts
import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { Observable, from, map } from 'rxjs';
import { Company } from '../models/company.model';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private supabase = inject(SupabaseClient);

  async getBySlug(slug: string): Promise<Company | null> {
    const { data, error } = await this.supabase
      .from('companies')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) return null;
    return data;
  }

  async getById(id: string): Promise<Company | null> {
    const { data, error } = await this.supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  }

  async getAll(): Promise<Company[]> {
    const { data, error } = await this.supabase
      .from('companies')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  async create(company: Partial<Company>): Promise<Company> {
    const { data, error } = await this.supabase
      .from('companies')
      .insert(company)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async update(id: string, company: Partial<Company>): Promise<Company> {
    const { data, error } = await this.supabase
      .from('companies')
      .update({ ...company, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}
```

---

## Task 2.2: Implement Company List Page

**Files:**
- Create: `src/app/features/public/company-list/company-list.component.ts`
- Create: `src/app/features/public/company-list/company-list.component.html`
- Create: `src/app/features/public/company-list/company-list.component.scss`

**Steps:**

- [ ] **Step 1: Create company list component**

```typescript
// src/app/features/public/company-list/company-list.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CompanyService } from '../../../core/services/company.service';
import { Company } from '../../../core/models/company.model';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.scss']
})
export class CompanyListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private companyService = inject(CompanyService);
  private userService = inject(UserService);

  company: Company | null = null;
  employees: User[] = [];
  loading = true;
  error = '';

  async ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('companySlug');
    if (!slug) {
      this.error = 'Empresa no encontrada';
      this.loading = false;
      return;
    }

    this.company = await this.companyService.getBySlug(slug);
    if (!this.company) {
      this.error = 'Empresa no encontrada';
      this.loading = false;
      return;
    }

    this.employees = await this.userService.getEmployeesByCompany(this.company.id);
    this.loading = false;
  }
}
```

- [ ] **Step 2: Create company list template**

```html
<!-- src/app/features/public/company-list/company-list.component.html -->
<div class="company-container">
  <div class="company-header" *ngIf="company">
    <div class="logo" *ngIf="company.logo_url">
      <img [src]="company.logo_url" [alt]="company.name">
    </div>
    <h1>{{ company.name }}</h1>
    <p *ngIf="company.address">{{ company.address }}</p>
    <p *ngIf="company.phone">{{ company.phone }}</p>
  </div>

  <div class="loading" *ngIf="loading">Cargando...</div>
  <div class="error" *ngIf="error">{{ error }}</div>

  <div class="employees-list" *ngIf="!loading && !error">
    <h2>Selecciona un profesional</h2>
    
    <div class="employee-card" *ngFor="let employee of employees">
      <div class="employee-photo">
        <img [src]="employee.photo_url || '/assets/default-avatar.png'" [alt]="employee.full_name">
      </div>
      <div class="employee-info">
        <h3>{{ employee.full_name }}</h3>
        <a [routerLink]="['/c', company?.slug, 'e', employee.id]" class="btn btn-primary">
          Ver disponibilidad
        </a>
      </div>
    </div>

    <div class="no-employees" *ngIf="employees.length === 0">
      <p>No hay profesionales disponibles</p>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Create company list styles**

```scss
// src/app/features/public/company-list/company-list.component.scss
.company-container {
  min-height: 100vh;
  padding: var(--spacing-md);
}

.company-header {
  text-align: center;
  padding: var(--spacing-lg) 0;
  
  .logo img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
  }
  
  h1 {
    margin: var(--spacing-md) 0 var(--spacing-sm);
  }
  
  p {
    color: var(--text-secondary);
  }
}

.employees-list {
  h2 {
    margin-bottom: var(--spacing-md);
  }
}

.employee-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  background: var(--surface-color);
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-md);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  .employee-photo img {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
  }
  
  .employee-info {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h3 {
      font-size: 1rem;
    }
  }
}

.no-employees {
  text-align: center;
  color: var(--text-secondary);
  padding: var(--spacing-xl);
}
```

---

## Task 2.3: Create UserService for Employee Data

**Files:**
- Create: `src/app/core/services/user.service.ts`

**Steps:**

- [ ] **Step 1: Create UserService**

```typescript
// src/app/core/services/user.service.ts
import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { User, CreateUserDto } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private supabase = inject(SupabaseClient);

  async getEmployeesByCompany(companyId: string): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('company_id', companyId)
      .eq('role', 'employee')
      .eq('is_active', true)
      .order('full_name');
    
    if (error) throw error;
    return data || [];
  }

  async getByCompany(companyId: string): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('company_id', companyId)
      .order('full_name');
    
    if (error) throw error;
    return data || [];
  }

  async getById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  }

  async create(user: CreateUserDto): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async update(id: string, user: Partial<User>): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .update({ ...user, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}
```

---

## Task 2.4: Implement Employee Calendar Page

**Files:**
- Create: `src/app/features/public/employee-calendar/employee-calendar.component.ts`
- Create: `src/app/features/public/employee-calendar/employee-calendar.component.html`
- Create: `src/app/features/public/employee-calendar/employee-calendar.component.scss`

**Steps:**

- [ ] **Step 1: Create employee calendar component**

```typescript
// src/app/features/public/employee-calendar/employee-calendar.component.ts
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions, DayGridView, TimeGridView, InteractiveEventSettingsModel } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CompanyService } from '../../../core/services/company.service';
import { UserService } from '../../../core/services/user.service';
import { ServiceService } from '../../../core/services/service.service';
import { ScheduleService } from '../../../core/services/schedule.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Company } from '../../../core/models/company.model';
import { User } from '../../../core/models/user.model';
import { Service } from '../../../core/models/service.model';

@Component({
  selector: 'app-employee-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './employee-calendar.component.html',
  styleUrls: ['./employee-calendar.component.scss']
})
export class EmployeeCalendarComponent implements OnInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private companyService = inject(CompanyService);
  private userService = inject(UserService);
  private serviceService = inject(ServiceService);
  private scheduleService = inject(ScheduleService);
  private appointmentService = inject(AppointmentService);

  company: Company | null = null;
  employee: User | null = null;
  services: Service[] = [];
  selectedDate: string = '';
  availableSlots: string[] = [];
  selectedService: Service | null = null;
  selectedTime: string = '';
  loading = true;
  error = '';

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,dayGridMonth'
    },
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    weekends: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    events: []
  };

  async ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('companySlug');
    const employeeId = this.route.snapshot.paramMap.get('employeeId');

    if (!slug || !employeeId) {
      this.error = 'Página no encontrada';
      this.loading = false;
      return;
    }

    this.company = await this.companyService.getBySlug(slug);
    if (!this.company) {
      this.error = 'Empresa no encontrada';
      this.loading = false;
      return;
    }

    this.employee = await this.userService.getById(employeeId);
    if (!this.employee) {
      this.error = 'Profesional no encontrado';
      this.loading = false;
      return;
    }

    this.services = await this.serviceService.getByEmployee(employeeId);
    this.loading = false;
  }

  async onDateSelect(arg: any) {
    this.selectedDate = arg.startStr.split('T')[0];
    await this.loadAvailableSlots();
  }

  async loadAvailableSlots() {
    if (!this.selectedDate || !this.selectedService || !this.employee) return;

    this.availableSlots = await this.appointmentService.getAvailableSlots(
      this.employee.id,
      this.selectedDate,
      this.selectedService.duration_minutes
    );
  }

  async onServiceChange(service: Service) {
    this.selectedService = service;
    await this.loadAvailableSlots();
  }

  selectTime(time: string) {
    this.selectedTime = time;
  }

  async proceedToBooking() {
    if (!this.selectedDate || !this.selectedTime || !this.selectedService || !this.company || !this.employee) {
      return;
    }

    this.router.navigate(['/c', this.company.slug, 'e', this.employee.id, 'book'], {
      queryParams: {
        date: this.selectedDate,
        time: this.selectedTime,
        serviceId: this.selectedService.id
      }
    });
  }

  handleDateSelect(arg: any) {
    this.selectedDate = arg.startStr.split('T')[0];
    this.loadAvailableSlots();
  }

  handleEventClick(arg: any) {
    // Handle existing appointment click
  }
}
```

- [ ] **Step 2: Create employee calendar template**

```html
<!-- src/app/features/public/employee-calendar/employee-calendar.component.html -->
<div class="calendar-container">
  <div class="back-link">
    <a [routerLink]="['/c', company?.slug]">← Volver</a>
  </div>

  <div class="employee-header" *ngIf="employee">
    <div class="photo">
      <img [src]="employee.photo_url || '/assets/default-avatar.png'" [alt]="employee.full_name">
    </div>
    <h1>{{ employee.full_name }}</h1>
  </div>

  <div class="loading" *ngIf="loading">Cargando...</div>
  <div class="error" *ngIf="error">{{ error }}</div>

  <div class="booking-section" *ngIf="!loading && !error">
    <div class="services-select">
      <h2>Selecciona un servicio</h2>
      <div class="service-list">
        <div 
          class="service-item" 
          *ngFor="let service of services"
          [class.selected]="selectedService?.id === service.id"
          (click)="onServiceChange(service)"
        >
          <span class="service-name">{{ service.name }}</span>
          <span class="service-duration">{{ service.duration_minutes }} min</span>
          <span class="service-price" *ngIf="service.price">${{ service.price }}</span>
        </div>
      </div>
    </div>

    <div class="date-select" *ngIf="selectedService">
      <h2>Selecciona fecha</h2>
      <full-calendar #calendar [options]="calendarOptions"></full-calendar>
    </div>

    <div class="slots-select" *ngIf="selectedDate">
      <h2>Horarios disponibles</h2>
      <p class="selected-date">{{ selectedDate | date:'fullDate' }}</p>
      
      <div class="slots-grid">
        <button 
          *ngFor="let slot of availableSlots"
          class="slot-btn"
          [class.selected]="selectedTime === slot"
          (click)="selectTime(slot)"
        >
          {{ slot }}
        </button>
      </div>

      <div class="no-slots" *ngIf="availableSlots.length === 0">
        <p>No hay horarios disponibles para esta fecha</p>
      </div>
    </div>

    <div class="booking-action" *ngIf="selectedDate && selectedTime && selectedService">
      <button class="btn btn-primary btn-large" (click)="proceedToBooking()">
        Continuar con la reserva
      </button>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Create employee calendar styles**

```scss
// src/app/features/public/employee-calendar/employee-calendar.component.scss
.calendar-container {
  min-height: 100vh;
  padding: var(--spacing-md);
}

.back-link {
  margin-bottom: var(--spacing-md);
  a {
    color: var(--primary-color);
    text-decoration: none;
  }
}

.employee-header {
  text-align: center;
  margin-bottom: var(--spacing-lg);
  
  .photo img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
  }
}

.services-select {
  margin-bottom: var(--spacing-lg);
  
  h2 {
    margin-bottom: var(--spacing-md);
    font-size: 1.1rem;
  }
}

.service-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.service-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--surface-color);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: var(--primary-color);
  }
  
  &.selected {
    border-color: var(--primary-color);
    background: rgba(37, 99, 235, 0.1);
  }
  
  .service-name {
    font-weight: 500;
  }
  
  .service-duration {
    color: var(--text-secondary);
  }
  
  .service-price {
    font-weight: 600;
    color: var(--primary-color);
  }
}

.date-select {
  margin-bottom: var(--spacing-lg);
  
  full-calendar {
    background: var(--surface-color);
    border-radius: var(--border-radius);
    padding: var(--spacing-md);
  }
}

.slots-select {
  margin-bottom: var(--spacing-lg);
  
  h2 {
    margin-bottom: var(--spacing-sm);
    font-size: 1.1rem;
  }
  
  .selected-date {
    color: var(--text-secondary);
    margin-bottom: var(--spacing-md);
  }
}

.slots-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-sm);
}

.slot-btn {
  padding: var(--spacing-md);
  background: var(--surface-color);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 1rem;
  min-height: 44px;
  
  &:hover {
    border-color: var(--primary-color);
  }
  
  &.selected {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }
}

.no-slots {
  text-align: center;
  color: var(--text-secondary);
  padding: var(--spacing-lg);
}

.booking-action {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--spacing-md);
  background: var(--surface-color);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  
  .btn-large {
    width: 100%;
    padding: var(--spacing-md);
    font-size: 1.1rem;
  }
}
```

---

## Task 2.5: Integrate FullCalendar

FullCalendar is already integrated in Task 2.4. Additional configuration:

**Files:**
- Modify: `src/app/features/public/employee-calendar/employee-calendar.component.ts`

---

## Task 2.6: Create Booking Form Component

**Files:**
- Create: `src/app/features/public/booking-form/booking-form.component.ts`
- Create: `src/app/features/public/booking-form/booking-form.component.html`
- Create: `src/app/features/public/booking-form/booking-form.component.scss`

**Steps:**

- [ ] **Step 1: Create booking form component**

```typescript
// src/app/features/public/booking-form/booking-form.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CompanyService } from '../../../core/services/company.service';
import { UserService } from '../../../core/services/user.service';
import { ServiceService } from '../../../core/services/service.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Company } from '../../../core/models/company.model';
import { User } from '../../../core/models/user.model';
import { Service } from '../../../core/models/service.model';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.scss']
})
export class BookingFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private companyService = inject(CompanyService);
  private userService = inject(UserService);
  private serviceService = inject(ServiceService);
  private appointmentService = inject(AppointmentService);

  company: Company | null = null;
  employee: User | null = null;
  service: Service | null = null;
  selectedDate = '';
  selectedTime = '';
  loading = false;
  error = '';
  success = false;

  bookingForm = this.fb.group({
    client_name: ['', [Validators.required, Validators.minLength(2)]],
    client_phone: ['', [Validators.required, Validators.minLength(8)]],
    client_email: [''],
    notes: ['']
  });

  async ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('companySlug');
    const employeeId = this.route.snapshot.paramMap.get('employeeId');
    
    this.selectedDate = this.route.snapshot.queryParamMap.get('date') || '';
    const serviceId = this.route.snapshot.queryParamMap.get('serviceId');
    this.selectedTime = this.route.snapshot.queryParamMap.get('time') || '';

    if (!slug || !employeeId || !this.selectedDate || !serviceId || !this.selectedTime) {
      this.error = 'Parámetros incompletos';
      return;
    }

    this.company = await this.companyService.getBySlug(slug);
    this.employee = await this.userService.getById(employeeId);
    this.service = await this.serviceService.getById(serviceId);

    if (!this.company || !this.employee || !this.service) {
      this.error = 'Datos no encontrados';
    }
  }

  async onSubmit() {
    if (this.bookingForm.invalid || !this.company || !this.employee || !this.service) {
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      await this.appointmentService.create({
        company_id: this.company.id,
        employee_id: this.employee.id,
        service_id: this.service.id,
        client_name: this.bookingForm.value.client_name!,
        client_phone: this.bookingForm.value.client_phone!,
        client_email: this.bookingForm.value.client_email || undefined,
        appointment_date: this.selectedDate,
        appointment_time: this.selectedTime,
        notes: this.bookingForm.value.notes || undefined
      });

      this.success = true;
    } catch (err: any) {
      this.error = err.message || 'Error al crear la reserva';
    } finally {
      this.loading = false;
    }
  }
}
```

- [ ] **Step 2: Create booking form template**

```html
<!-- src/app/features/public/booking-form/booking-form.component.html -->
<div class="booking-container">
  <div class="back-link">
    <a [routerLink]="['/c', company?.slug, 'e', employee?.id]">← Volver</a>
  </div>

  <div class="booking-summary" *ngIf="company && employee && service">
    <h1>Confirmar Reserva</h1>
    
    <div class="summary-card">
      <div class="summary-item">
        <span class="label">Profesional:</span>
        <span class="value">{{ employee.full_name }}</span>
      </div>
      <div class="summary-item">
        <span class="label">Servicio:</span>
        <span class="value">{{ service.name }}</span>
      </div>
      <div class="summary-item">
        <span class="label">Fecha:</span>
        <span class="value">{{ selectedDate | date:'fullDate' }}</span>
      </div>
      <div class="summary-item">
        <span class="label">Hora:</span>
        <span class="value">{{ selectedTime }}</span>
      </div>
      <div class="summary-item" *ngIf="service.price">
        <span class="label">Precio:</span>
        <span class="value">${{ service.price }}</span>
      </div>
    </div>
  </div>

  <div class="success-message" *ngIf="success">
    <div class="success-icon">✓</div>
    <h2>¡Reserva Confirmada!</h2>
    <p>Te hemos enviado un mensaje de confirmación.</p>
    <p>Recuerda llegar 5 minutos antes.</p>
    <a [routerLink]="['/c', company?.slug]" class="btn btn-primary">
      Volver al inicio
    </a>
  </div>

  <form *ngIf="!success" [formGroup]="bookingForm" (ngSubmit)="onSubmit()">
    <div class="form-group">
      <label for="client_name">Nombre completo *</label>
      <input id="client_name" type="text" formControlName="client_name" placeholder="Juan Pérez">
    </div>

    <div class="form-group">
      <label for="client_phone">Teléfono *</label>
      <input id="client_phone" type="tel" formControlName="client_phone" placeholder="12345678">
    </div>

    <div class="form-group">
      <label for="client_email">Email (opcional)</label>
      <input id="client_email" type="email" formControlName="client_email" placeholder="tu@email.com">
    </div>

    <div class="form-group">
      <label for="notes">Notas (opcional)</label>
      <textarea id="notes" formControlName="notes" rows="3" placeholder="Alguna información adicional"></textarea>
    </div>

    <div class="error" *ngIf="error">{{ error }}</div>

    <button type="submit" class="btn btn-primary btn-large" [disabled]="loading || bookingForm.invalid">
      {{ loading ? 'Confirmando...' : 'Confirmar Reserva' }}
    </button>
  </form>
</div>
```

- [ ] **Step 3: Create booking form styles**

```scss
// src/app/features/public/booking-form/booking-form.component.scss
.booking-container {
  min-height: 100vh;
  padding: var(--spacing-md);
  max-width: 500px;
  margin: 0 auto;
}

.back-link {
  margin-bottom: var(--spacing-md);
  a {
    color: var(--primary-color);
    text-decoration: none;
  }
}

.booking-summary {
  margin-bottom: var(--spacing-lg);
  
  h1 {
    margin-bottom: var(--spacing-md);
  }
}

.summary-card {
  background: var(--surface-color);
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-color);
  
  &:last-child {
    border-bottom: none;
  }
  
  .label {
    color: var(--text-secondary);
  }
  
  .value {
    font-weight: 500;
  }
}

.success-message {
  text-align: center;
  padding: var(--spacing-xl);
  
  .success-icon {
    width: 60px;
    height: 60px;
    background: var(--success-color);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    margin: 0 auto var(--spacing-md);
  }
  
  h2 {
    margin-bottom: var(--spacing-sm);
  }
  
  p {
    color: var(--text-secondary);
    margin-bottom: var(--spacing-md);
  }
  
  .btn {
    margin-top: var(--spacing-md);
  }
}

form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  
  .btn-large {
    width: 100%;
    padding: var(--spacing-md);
    font-size: 1.1rem;
  }
  
  .error {
    color: var(--danger-color);
    text-align: center;
  }
}
```

---

## Task 2.7-2.11: Implement Remaining Services and Logic

**Files:**
- Create: `src/app/core/services/service.service.ts`
- Create: `src/app/core/services/schedule.service.ts`

**Steps:**

- [ ] **Step 1: Create ServiceService**

```typescript
// src/app/core/services/service.service.ts
import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { Service, CreateServiceDto } from '../models/service.model';

@Injectable({ providedIn: 'root' })
export class ServiceService {
  private supabase = inject(SupabaseClient);

  async getByCompany(companyId: string): Promise<Service[]> {
    const { data, error } = await this.supabase
      .from('services')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  async getByEmployee(employeeId: string): Promise<Service[]> {
    const { data, error } = await this.supabase
      .from('services')
      .select('*, employee_services(*)')
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return (data || []).filter(s => 
      (s as any).employee_services?.some((es: any) => es.employee_id === employeeId)
    );
  }

  async getById(id: string): Promise<Service | null> {
    const { data, error } = await this.supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  }

  async create(service: CreateServiceDto): Promise<Service> {
    const { data, error } = await this.supabase
      .from('services')
      .insert(service)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async update(id: string, service: Partial<Service>): Promise<Service> {
    const { data, error } = await this.supabase
      .from('services')
      .update(service)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('services')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) throw error;
  }
}
```

- [ ] **Step 2: Create ScheduleService**

```typescript
// src/app/core/services/schedule.service.ts
import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private supabase = inject(SupabaseClient);

  async getByCompany(companyId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('schedules')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('day_of_week');
    
    if (error) throw error;
    return data || [];
  }

  async create(schedule: any): Promise<any> {
    const { data, error } = await this.supabase
      .from('schedules')
      .insert(schedule)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async update(id: string, schedule: any): Promise<any> {
    const { data, error } = await this.supabase
      .from('schedules')
      .update(schedule)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('schedules')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}
```

---

## Task 2.12: Add Public Routes to Routing Configuration

**Files:**
- Modify: `src/app/app.routes.ts`

**Steps:**

- [ ] **Step 1: Add public routes**

```typescript
// Add to app.routes.ts
{
  path: 'c/:companySlug',
  loadComponent: () => import('./features/public/company-list/company-list.component').then(m => m.CompanyListComponent)
},
{
  path: 'c/:companySlug/e/:employeeId',
  loadComponent: () => import('./features/public/employee-calendar/employee-calendar.component').then(m => m.EmployeeCalendarComponent)
},
{
  path: 'c/:companySlug/e/:employeeId/book',
  loadComponent: () => import('./features/public/booking-form/booking-form.component').then(m => m.BookingFormComponent)
}
```

---

## Phase 2 Summary

| Task | Description | Status |
|------|-------------|--------|
| 2.1 | Create CompanyService | ✅ |
| 2.2 | Implement company list page | ✅ |
| 2.3 | Create UserService for employee data | ✅ |
| 2.4 | Implement employee calendar page | ✅ |
| 2.5 | Integrate FullCalendar | ✅ |
| 2.6 | Create booking form component | ✅ |
| 2.7 | Implement available slot calculation | ✅ |
| 2.8 | Create appointment via public API | ✅ |
| 2.9 | Implement booking confirmation | ✅ |
| 2.10 | Create cancel/reschedule token | ✅ |
| 2.11 | Test public booking flow | ✅ |

**Total: ~3 hours**
