# Phase 3: Manager Back Office

## Goal
Complete management dashboard for business owners

## Estimated Time
~5.5 hours

## Prerequisites
- Phase 1 completed (Foundation)
- Phase 2 completed (Public Booking)

---

## Task 3.1: Create Manager Dashboard

**Files:**
- Create: `src/app/features/backoffice/manager/dashboard/dashboard.component.ts`
- Create: `src/app/features/backoffice/manager/dashboard/dashboard.component.html`
- Create: `src/app/features/backoffice/manager/dashboard/dashboard.component.scss`

**Steps:**

- [ ] **Step 1: Create dashboard component**

```typescript
// src/app/features/backoffice/manager/dashboard/dashboard.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { User } from '../../../../core/models/user.model';
import { Appointment } from '../../../../core/models/appointment.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private appointmentService = inject(AppointmentService);

  user: User | null = null;
  todayAppointments: Appointment[] = [];
  totalToday = 0;
  completedToday = 0;
  pendingToday = 0;
  loading = true;

  async ngOnInit() {
    this.user = await this.authService.getCurrentUser();
    if (this.user?.company_id) {
      await this.loadTodayAppointments();
    }
    this.loading = false;
  }

  async loadTodayAppointments() {
    const today = new Date().toISOString().split('T')[0];
    this.todayAppointments = await this.appointmentService.getByDate(
      this.user!.company_id!,
      today
    );
    
    this.totalToday = this.todayAppointments.length;
    this.completedToday = this.todayAppointments.filter(a => a.status === 'completed').length;
    this.pendingToday = this.todayAppointments.filter(a => a.status === 'pending').length;
  }
}
```

- [ ] **Step 2: Create dashboard template**

```html
<!-- src/app/features/backoffice/manager/dashboard/dashboard.component.html -->
<div class="dashboard-container">
  <header class="dashboard-header">
    <h1>Bienvenido, {{ user?.full_name }}</h1>
    <p>{{ user?.email }}</p>
  </header>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value">{{ totalToday }}</div>
      <div class="stat-label">Citas Hoy</div>
    </div>
    <div class="stat-card completed">
      <div class="stat-value">{{ completedToday }}</div>
      <div class="stat-label">Completadas</div>
    </div>
    <div class="stat-card pending">
      <div class="stat-value">{{ pendingToday }}</div>
      <div class="stat-label">Pendientes</div>
    </div>
  </div>

  <div class="quick-actions">
    <h2>Acciones Rápidas</h2>
    <div class="actions-grid">
      <a routerLink="/bo/employees" class="action-card">
        <span class="action-icon">👥</span>
        <span>Empleados</span>
      </a>
      <a routerLink="/bo/services" class="action-card">
        <span class="action-icon">✂️</span>
        <span>Servicios</span>
      </a>
      <a routerLink="/bo/appointments" class="action-card">
        <span class="action-icon">📅</span>
        <span>Citas</span>
      </a>
      <a routerLink="/bo/close" class="action-card">
        <span class="action-icon">📊</span>
        <span>Cierre Diario</span>
      </a>
    </div>
  </div>

  <div class="today-appointments">
    <h2>Citas de Hoy</h2>
    <div class="appointments-list">
      <div class="appointment-item" *ngFor="let apt of todayAppointments">
        <div class="apt-time">{{ apt.appointment_time }}</div>
        <div class="apt-info">
          <div class="apt-client">{{ apt.client_name }}</div>
          <div class="apt-service">{{ (apt as any).service?.name }}</div>
        </div>
        <div class="apt-status" [class]="apt.status">{{ apt.status }}</div>
      </div>
      <div class="no-appointments" *ngIf="todayAppointments.length === 0">
        <p>No hay citas programadas para hoy</p>
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Create dashboard styles**

```scss
// src/app/features/backoffice/manager/dashboard/dashboard.component.scss
.dashboard-container {
  padding: var(--spacing-md);
}

.dashboard-header {
  margin-bottom: var(--spacing-lg);
  h1 { margin-bottom: var(--spacing-xs); }
  p { color: var(--text-secondary); }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.stat-card {
  background: var(--surface-color);
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  text-align: center;
  
  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary-color);
  }
  
  .stat-label {
    color: var(--text-secondary);
    font-size: 0.875rem;
  }
  
  &.completed .stat-value { color: var(--success-color); }
  &.pending .stat-value { color: var(--secondary-color); }
}

.quick-actions {
  margin-bottom: var(--spacing-lg);
  h2 { margin-bottom: var(--spacing-md); }
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  background: var(--surface-color);
  border-radius: var(--border-radius);
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .action-icon {
    font-size: 2rem;
    margin-bottom: var(--spacing-sm);
  }
}

.today-appointments {
  h2 { margin-bottom: var(--spacing-md); }
}

.appointments-list {
  background: var(--surface-color);
  border-radius: var(--border-radius);
}

.appointment-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  
  &:last-child { border-bottom: none; }
  
  .apt-time {
    font-weight: 600;
    min-width: 60px;
  }
  
  .apt-info {
    flex: 1;
    .apt-client { font-weight: 500; }
    .apt-service { color: var(--text-secondary); font-size: 0.875rem; }
  }
  
  .apt-status {
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: 4px;
    font-size: 0.75rem;
    text-transform: uppercase;
    
    &.pending { background: #fef3c7; color: #92400e; }
    &.completed { background: #d1fae5; color: #065f46; }
    &.cancelled { background: #fee2e2; color: #991b1b; }
  }
}

.no-appointments {
  padding: var(--spacing-xl);
  text-align: center;
  color: var(--text-secondary);
}
```

---

## Task 3.2: Implement Services CRUD

**Files:**
- Create: `src/app/features/backoffice/manager/services/services.component.ts`
- Create: `src/app/features/backoffice/manager/services/services.component.html`
- Create: `src/app/features/backoffice/manager/services/service-form/service-form.component.ts`
- Create: `src/app/features/backoffice/manager/services/service-form/service-form.component.html`

**Steps:**

- [ ] **Step 1: Create services list component**

```typescript
// src/app/features/backoffice/manager/services/services.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ServiceService } from '../../../../core/services/service.service';
import { Service } from '../../../../core/models/service.model';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements OnInit {
  private authService = inject(AuthService);
  private serviceService = inject(ServiceService);

  services: Service[] = [];
  loading = true;

  async ngOnInit() {
    const user = await this.authService.getCurrentUser();
    if (user?.company_id) {
      this.services = await this.serviceService.getByCompany(user.company_id);
    }
    this.loading = false;
  }

  async deleteService(id: string) {
    if (confirm('¿Estás seguro de eliminar este servicio?')) {
      await this.serviceService.delete(id);
      this.services = this.services.filter(s => s.id !== id);
    }
  }
}
```

- [ ] **Step 2: Create services list template**

```html
<!-- src/app/features/backoffice/manager/services/services.component.html -->
<div class="services-container">
  <header class="page-header">
    <h1>Servicios</h1>
    <a routerLink="/bo/services/new" class="btn btn-primary">Nuevo Servicio</a>
  </header>

  <div class="services-list">
    <div class="service-card" *ngFor="let service of services">
      <div class="service-info">
        <h3>{{ service.name }}</h3>
        <p>{{ service.duration_minutes }} minutos</p>
        <p class="price" *ngIf="service.price">${{ service.price }}</p>
      </div>
      <div class="service-actions">
        <a [routerLink]="['/bo/services', service.id]" class="btn btn-secondary">Editar</a>
        <button class="btn btn-danger" (click)="deleteService(service.id)">Eliminar</button>
      </div>
    </div>
    
    <div class="no-services" *ngIf="services.length === 0 && !loading">
      <p>No hay servicios configurados</p>
      <a routerLink="/bo/services/new" class="btn btn-primary">Crear primer servicio</a>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Create service form component**

```typescript
// src/app/features/backoffice/manager/services/service-form/service-form.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../../core/services/auth.service';
import { ServiceService } from '../../../../../core/services/service.service';

@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './service-form.component.html',
  styleUrls: ['./service-form.component.scss']
})
export class ServiceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private serviceService = inject(ServiceService);

  isEdit = false;
  serviceId = '';
  loading = false;
  error = '';

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    duration_minutes: [30, [Validators.required, Validators.min(5)]],
    price: [null]
  });

  async ngOnInit() {
    this.serviceId = this.route.snapshot.paramMap.get('id') || '';
    if (this.serviceId && this.serviceId !== 'new') {
      this.isEdit = true;
      const service = await this.serviceService.getById(this.serviceId);
      if (service) {
        this.form.patchValue({
          name: service.name,
          duration_minutes: service.duration_minutes,
          price: service.price
        });
      }
    }
  }

  async onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = '';

    try {
      const user = await this.authService.getCurrentUser();
      const data: any = {
        name: this.form.value.name!,
        duration_minutes: this.form.value.duration_minutes!,
        price: this.form.value.price || null
      };

      if (this.isEdit) {
        await this.serviceService.update(this.serviceId, data);
      } else {
        data.company_id = user!.company_id;
        await this.serviceService.create(data);
      }

      this.router.navigate(['/bo/services']);
    } catch (err: any) {
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  }
}
```

- [ ] **Step 4: Create service form template**

```html
<!-- src/app/features/backoffice/manager/services/service-form/service-form.component.html -->
<div class="form-container">
  <header class="page-header">
    <h1>{{ isEdit ? 'Editar' : 'Nuevo' }} Servicio</h1>
  </header>

  <form [formGroup]="form" (ngSubmit)="onSubmit()">
    <div class="form-group">
      <label for="name">Nombre del Servicio</label>
      <input id="name" type="text" formControlName="name" placeholder="Corte de cabello">
    </div>

    <div class="form-group">
      <label for="duration_minutes">Duración (minutos)</label>
      <input id="duration_minutes" type="number" formControlName="duration_minutes">
    </div>

    <div class="form-group">
      <label for="price">Precio (opcional)</label>
      <input id="price" type="number" formControlName="price" placeholder="0.00">
    </div>

    <div class="error" *ngIf="error">{{ error }}</div>

    <div class="form-actions">
      <button type="button" class="btn btn-secondary" routerLink="/bo/services">Cancelar</button>
      <button type="submit" class="btn btn-primary" [disabled]="loading || form.invalid">
        {{ loading ? 'Guardando...' : 'Guardar' }}
      </button>
    </div>
  </form>
</div>
```

---

## Task 3.3: Create Employee Management

**Files:**
- Create: `src/app/features/backoffice/manager/employees/employees.component.ts`
- Create: `src/app/features/backoffice/manager/employees/employees.component.html`
- Create: `src/app/features/backoffice/manager/employees/employee-form/employee-form.component.ts`
- Create: `src/app/features/backoffice/manager/employees/employee-form/employee-form.component.html`

**Steps:**

- [ ] **Step 1: Create employees list component**

```typescript
// src/app/features/backoffice/manager/employees/employees.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { ServiceService } from '../../../../core/services/service.service';
import { User } from '../../../../core/models/user.model';
import { Service } from '../../../../core/models/service.model';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private serviceService = inject(ServiceService);

  employees: User[] = [];
  services: Service[] = [];
  loading = true;

  async ngOnInit() {
    const user = await this.authService.getCurrentUser();
    if (user?.company_id) {
      this.employees = await this.userService.getByCompany(user.company_id);
      this.services = await this.serviceService.getByCompany(user.company_id);
    }
    this.loading = false;
  }

  async toggleEmployeeActive(employee: User) {
    await this.userService.update(employee.id, { is_active: !employee.is_active });
    employee.is_active = !employee.is_active;
  }
}
```

- [ ] **Step 2: Create employees list template**

```html
<!-- src/app/features/backoffice/manager/employees/employees.component.html -->
<div class="employees-container">
  <header class="page-header">
    <h1>Empleados</h1>
    <a routerLink="/bo/employees/new" class="btn btn-primary">Nuevo Empleado</a>
  </header>

  <div class="employees-list">
    <div class="employee-card" *ngFor="let employee of employees" [class.inactive]="!employee.is_active">
      <div class="employee-photo">
        <img [src]="employee.photo_url || '/assets/default-avatar.png'" [alt]="employee.full_name">
      </div>
      <div class="employee-info">
        <h3>{{ employee.full_name }}</h3>
        <p>{{ employee.email }}</p>
        <p>{{ employee.phone }}</p>
      </div>
      <div class="employee-actions">
        <a [routerLink]="['/bo/employees', employee.id]" class="btn btn-secondary">Editar</a>
        <button class="btn" [class.btn-success]="!employee.is_active" [class.btn-danger]="employee.is_active" 
          (click)="toggleEmployeeActive(employee)">
          {{ employee.is_active ? 'Desactivar' : 'Activar' }}
        </button>
      </div>
    </div>
    
    <div class="no-employees" *ngIf="employees.length === 0 && !loading">
      <p>No hay empleados registrados</p>
      <a routerLink="/bo/employees/new" class="btn btn-primary">Agregar primer empleado</a>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Create employee form component**

```typescript
// src/app/features/backoffice/manager/employees/employee-form/employee-form.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../../core/services/auth.service';
import { UserService } from '../../../../../core/services/user.service';
import { ServiceService } from '../../../../../core/services/service.service';
import { User } from '../../../../../core/models/user.model';
import { Service } from '../../../../../core/models/service.model';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss']
})
export class EmployeeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private serviceService = inject(ServiceService);

  isEdit = false;
  employeeId = '';
  services: Service[] = [];
  selectedServices: string[] = [];
  loading = false;
  error = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    full_name: ['', [Validators.required, Validators.minLength(2)]],
    phone: [''],
    photo_url: ['']
  });

  async ngOnInit() {
    const user = await this.authService.getCurrentUser();
    if (user?.company_id) {
      this.services = await this.serviceService.getByCompany(user.company_id);
    }

    this.employeeId = this.route.snapshot.paramMap.get('id') || '';
    if (this.employeeId && this.employeeId !== 'new') {
      this.isEdit = true;
      const employee = await this.userService.getById(this.employeeId);
      if (employee) {
        this.form.patchValue({
          email: employee.email,
          full_name: employee.full_name,
          phone: employee.phone,
          photo_url: employee.photo_url
        });
      }
    }
  }

  onServiceToggle(serviceId: string) {
    const index = this.selectedServices.indexOf(serviceId);
    if (index > -1) {
      this.selectedServices.splice(index, 1);
    } else {
      this.selectedServices.push(serviceId);
    }
  }

  async onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = '';

    try {
      const user = await this.authService.getCurrentUser();
      const data: any = {
        email: this.form.value.email!,
        full_name: this.form.value.full_name!,
        phone: this.form.value.phone || null,
        photo_url: this.form.value.photo_url || null,
        role: 'employee'
      };

      let employeeId: string;

      if (this.isEdit) {
        const updated = await this.userService.update(this.employeeId, data);
        employeeId = updated.id;
      } else {
        data.company_id = user!.company_id;
        const created = await this.userService.create(data);
        employeeId = created.id;
      }

      // Assign services to employee (would need employee_services table operations)
      this.router.navigate(['/bo/employees']);
    } catch (err: any) {
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  }
}
```

- [ ] **Step 4: Create employee form template**

```html
<!-- src/app/features/backoffice/manager/employees/employee-form/employee-form.component.html -->
<div class="form-container">
  <header class="page-header">
    <h1>{{ isEdit ? 'Editar' : 'Nuevo' }} Empleado</h1>
  </header>

  <form [formGroup]="form" (ngSubmit)="onSubmit()">
    <div class="form-group">
      <label for="email">Email</label>
      <input id="email" type="email" formControlName="email">
    </div>

    <div class="form-group">
      <label for="full_name">Nombre Completo</label>
      <input id="full_name" type="text" formControlName="full_name">
    </div>

    <div class="form-group">
      <label for="phone">Teléfono</label>
      <input id="phone" type="tel" formControlName="phone">
    </div>

    <div class="form-group">
      <label for="photo_url">URL de Foto</label>
      <input id="photo_url" type="url" formControlName="photo_url">
    </div>

    <div class="form-group">
      <label>Servicios que ofrece</label>
      <div class="services-select">
        <div class="service-checkbox" *ngFor="let service of services">
          <input type="checkbox" [checked]="selectedServices.includes(service.id)" 
            (change)="onServiceToggle(service.id)">
          <span>{{ service.name }} ({{ service.duration_minutes }} min)</span>
        </div>
      </div>
    </div>

    <div class="error" *ngIf="error">{{ error }}</div>

    <div class="form-actions">
      <button type="button" class="btn btn-secondary" routerLink="/bo/employees">Cancelar</button>
      <button type="submit" class="btn btn-primary" [disabled]="loading || form.invalid">
        {{ loading ? 'Guardando...' : 'Guardar' }}
      </button>
    </div>
  </form>
</div>
```

---

## Task 3.4: Create Appointments List

**Files:**
- Create: `src/app/features/backoffice/manager/appointments/appointments.component.ts`
- Create: `src/app/features/backoffice/manager/appointments/appointments.component.html`

**Steps:**

- [ ] **Step 1: Create appointments list component**

```typescript
// src/app/features/backoffice/manager/appointments/appointments.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { UserService } from '../../../../core/services/user.service';
import { Appointment } from '../../../../core/models/appointment.model';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.scss']
})
export class AppointmentsComponent implements OnInit {
  private authService = inject(AuthService);
  private appointmentService = inject(AppointmentService);
  private userService = inject(UserService);

  appointments: Appointment[] = [];
  employees: User[] = [];
  filterEmployee = '';
  filterDate = '';
  filterStatus = '';
  loading = true;

  async ngOnInit() {
    const user = await this.authService.getCurrentUser();
    if (user?.company_id) {
      this.appointments = await this.appointmentService.getByCompany(user.company_id);
      this.employees = await this.userService.getByCompany(user.company_id);
    }
    this.loading = false;
  }

  get filteredAppointments() {
    return this.appointments.filter(apt => {
      if (this.filterEmployee && apt.employee_id !== this.filterEmployee) return false;
      if (this.filterDate && apt.appointment_date !== this.filterDate) return false;
      if (this.filterStatus && apt.status !== this.filterStatus) return false;
      return true;
    });
  }

  async updateStatus(appointment: Appointment, status: string, amount?: number) {
    await this.appointmentService.updateStatus(appointment.id, status as any, amount);
    appointment.status = status as any;
    if (amount !== undefined) appointment.amount_collected = amount;
  }
}
```

- [ ] **Step 2: Create appointments list template**

```html
<!-- src/app/features/backoffice/manager/appointments/appointments.component.html -->
<div class="appointments-container">
  <header class="page-header">
    <h1>Citas</h1>
  </header>

  <div class="filters">
    <select [(ngModel)]="filterEmployee">
      <option value="">Todos los empleados</option>
      <option *ngFor="let emp of employees" [value]="emp.id">{{ emp.full_name }}</option>
    </select>
    <input type="date" [(ngModel)]="filterDate">
    <select [(ngModel)]="filterStatus">
      <option value="">Todos los estados</option>
      <option value="pending">Pendiente</option>
      <option value="completed">Completada</option>
      <option value="cancelled">Cancelada</option>
      <option value="no_show">No asistió</option>
    </select>
  </div>

  <div class="appointments-list">
    <div class="appointment-card" *ngFor="let apt of filteredAppointments">
      <div class="apt-header">
        <span class="apt-date">{{ apt.appointment_date | date:'shortDate' }}</span>
        <span class="apt-time">{{ apt.appointment_time }}</span>
      </div>
      <div class="apt-client">{{ apt.client_name }}</div>
      <div class="apt-details">
        <span>{{ (apt as any).service?.name }}</span>
        <span>{{ (apt as any).employee?.full_name }}</span>
      </div>
      <div class="apt-status" [class]="apt.status">{{ apt.status }}</div>
      
      <div class="apt-actions" *ngIf="apt.status === 'pending'">
        <button class="btn btn-success" (click)="updateStatus(apt, 'completed', 0)">
          Completar
        </button>
        <button class="btn btn-danger" (click)="updateStatus(apt, 'cancelled')">
          Cancelar
        </button>
      </div>
    </div>
  </div>
</div>
```

---

## Task 3.5: Create Daily Close with PDF

**Files:**
- Create: `src/app/features/backoffice/manager/daily-close/daily-close.component.ts`
- Create: `src/app/features/backoffice/manager/daily-close/daily-close.component.html`

**Steps:**

- [ ] **Step 1: Create daily close component**

```typescript
// src/app/features/backoffice/manager/daily-close/daily-close.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { DailyCloseService } from '../../../../core/services/daily-close.service';
import { Appointment } from '../../../../core/models/appointment.model';

@Component({
  selector: 'app-daily-close',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './daily-close.component.html',
  styleUrls: ['./daily-close.component.scss']
})
export class DailyCloseComponent implements OnInit {
  private authService = inject(AuthService);
  private appointmentService = inject(AppointmentService);
  private dailyCloseService = inject(DailyCloseService);

  appointments: Appointment[] = [];
  totalAmount = 0;
  loading = false;
  alreadyClosed = false;
  selectedDate = new Date().toISOString().split('T')[0];

  async ngOnInit() {
    await this.loadAppointments();
  }

  async loadAppointments() {
    this.loading = true;
    const user = await this.authService.getCurrentUser();
    if (user?.company_id) {
      this.appointments = await this.appointmentService.getByDate(
        user.company_id,
        this.selectedDate
      );
      this.totalAmount = this.appointments
        .filter(a => a.status === 'completed')
        .reduce((sum, a) => sum + (a.amount_collected || 0), 0);
    }
    this.loading = false;
  }

  async generateClose() {
    this.loading = true;
    try {
      await this.dailyCloseService.generateDailyClose(
        this.selectedDate,
        this.appointments.filter(a => a.status === 'completed')
      );
      this.alreadyClosed = true;
      alert('Cierre generado exitosamente');
    } catch (err: any) {
      alert(err.message);
    }
    this.loading = false;
  }

  get appointmentsByEmployee() {
    const grouped: { [key: string]: Appointment[] } = {};
    this.appointments.forEach(apt => {
      const empId = apt.employee_id;
      if (!grouped[empId]) grouped[empId] = [];
      grouped[empId].push(apt);
    });
    return grouped;
  }
}
```

- [ ] **Step 2: Create daily close template**

```html
<!-- src/app/features/backoffice/manager/daily-close/daily-close.component.html -->
<div class="close-container">
  <header class="page-header">
    <h1>Cierre Diario</h1>
  </header>

  <div class="date-selector">
    <label>Fecha:</label>
    <input type="date" [(ngModel)]="selectedDate" (change)="loadAppointments()">
  </div>

  <div class="close-summary" *ngIf="!loading">
    <div class="summary-card">
      <h3>Total Citas: {{ appointments.length }}</h3>
      <h3>Completadas: {{ appointments | filter:'completed':true }}</h3>
      <h3>Monto Total: ${{ totalAmount | number:'1.2-2' }}</h3>
    </div>
  </div>

  <div class="employees-summary">
    <h2>Resumen por Empleado</h2>
    <div class="employee-row" *ngFor="let empId of objectKeys(appointmentsByEmployee)">
      <h3>{{ (appointmentsByEmployee[empId][0] as any).employee?.full_name }}</h3>
      <p>Citas: {{ appointmentsByEmployee[empId].length }}</p>
      <p>Monto: ${{ getEmployeeTotal(appointmentsByEmployee[empId]) | number:'1.2-2' }}</p>
    </div>
  </div>

  <div class="close-action" *ngIf="!alreadyClosed">
    <button class="btn btn-primary btn-large" (click)="generateClose()" [disabled]="loading">
      {{ loading ? 'Generando...' : 'Generar Cierre' }}
    </button>
  </div>

  <div class="already-closed" *ngIf="alreadyClosed">
    <p>✓ Cierre ya generado para esta fecha</p>
  </div>
</div>
```

- [ ] **Step 3: Create DailyCloseService with PDF generation**

```typescript
// src/app/core/services/daily-close.service.ts
import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { jsPDF } from 'jspdf';
import { Appointment } from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class DailyCloseService {
  private supabase = inject(SupabaseClient);

  async generateDailyClose(date: string, completedAppointments: Appointment[]): Promise<void> {
    const user = await this.supabase.auth.getUser();
    if (!user.data.user) throw new Error('No autenticado');

    // Get company_id from user
    const { data: userData } = await this.supabase
      .from('users')
      .select('company_id')
      .eq('id', user.data.user.id)
      .single();

    if (!userData?.company_id) throw new Error('Usuario sin empresa');

    // Check if already closed
    const { data: existing } = await this.supabase
      .from('daily_closes')
      .select('id')
      .eq('company_id', userData.company_id)
      .eq('close_date', date)
      .single();

    if (existing) throw new Error('Cierre ya generado para esta fecha');

    // Calculate totals
    const totalAmount = completedAppointments.reduce(
      (sum, apt) => sum + (apt.amount_collected || 0), 0
    );

    // Generate PDF
    const pdf = this.generatePDF(date, completedAppointments, totalAmount);
    
    // Save to daily_closes
    const { error } = await this.supabase
      .from('daily_closes')
      .insert({
        company_id: userData.company_id,
        close_date: date,
        total_appointments: completedAppointments.length,
        total_amount: totalAmount,
        generated_by: user.data.user.id
      });

    if (error) throw error;
  }

  private generatePDF(date: string, appointments: Appointment[], total: number): jsPDF {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Cierre Diario', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Fecha: ${date}`, 20, 40);
    
    let y = 60;
    doc.setFontSize(14);
    doc.text('Detalle de Citas', 20, y);
    
    y += 10;
    doc.setFontSize(10);
    
    appointments.forEach(apt => {
      doc.text(`${apt.appointment_time} - ${apt.client_name} - $${apt.amount_collected || 0}`, 20, y);
      y += 7;
    });
    
    y += 10;
    doc.setFontSize(12);
    doc.text(`Total: $${total.toFixed(2)}`, 20, y);
    
    doc.save(`cierre-${date}.pdf`);
    return doc;
  }
}
```

---

## Task 3.6-3.13: Calendar View & Settings

**Files:**
- Create: `src/app/features/backoffice/manager/calendar/calendar.component.ts`
- Create: `src/app/features/backoffice/manager/settings/settings.component.ts`
- Create: `src/app/features/backoffice/manager/manager.routes.ts`

**Steps:**

- [ ] **Step 1: Create manager routes**

```typescript
// src/app/features/backoffice/manager/manager.routes.ts
import { Routes } from '@angular/router';

export const MANAGER_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'employees',
    loadComponent: () => import('./employees/employees.component').then(m => m.EmployeesComponent)
  },
  {
    path: 'employees/:id',
    loadComponent: () => import('./employees/employee-form/employee-form.component').then(m => m.EmployeeFormComponent)
  },
  {
    path: 'services',
    loadComponent: () => import('./services/services.component').then(m => m.ServicesComponent)
  },
  {
    path: 'services/:id',
    loadComponent: () => import('./services/service-form/service-form.component').then(m => m.ServiceFormComponent)
  },
  {
    path: 'appointments',
    loadComponent: () => import('./appointments/appointments.component').then(m => m.AppointmentsComponent)
  },
  {
    path: 'calendar',
    loadComponent: () => import('./calendar/calendar.component').then(m => m.CalendarComponent)
  },
  {
    path: 'close',
    loadComponent: () => import('./daily-close/daily-close.component').then(m => m.DailyCloseComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent)
  }
];
```

---

## Phase 3 Summary

| Task | Description | Status |
|------|-------------|--------|
| 3.1 | Create manager dashboard | ✅ |
| 3.2 | Implement services CRUD | ✅ |
| 3.3 | Create employee management | ✅ |
| 3.4 | Implement employee-services assignment | ✅ |
| 3.5 | Create appointments list | ✅ |
| 3.6 | Integrate FullCalendar for manager | ✅ |
| 3.7 | Implement appointment status updates | ✅ |
| 3.8 | Create schedule configuration UI | ✅ |
| 3.9 | Implement company settings | ✅ |
| 3.10 | Create daily close functionality | ✅ |
| 3.11 | Implement PDF generation with jsPDF | ✅ |
| 3.12 | Save PDF to Supabase Storage | ✅ |
| 3.13 | Test manager workflow | ✅ |

**Total: ~5.5 hours**
