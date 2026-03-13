# Phase 5: Superadmin Panel

## Goal
System-wide administration interface

## Estimated Time
~2 hours

## Prerequisites
- Phase 1 completed (Foundation)

---

## Task 5.1: Create Superadmin Dashboard

**Files:**
- Create: `src/app/features/superadmin/dashboard/dashboard.component.ts`
- Create: `src/app/features/superadmin/dashboard/dashboard.component.html`

**Steps:**

- [ ] **Step 1: Create superadmin dashboard component**

```typescript
// src/app/features/superadmin/dashboard/dashboard.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CompanyService } from '../../../core/services/company.service';
import { UserService } from '../../../core/services/user.service';
import { Company } from '../../../core/models/company.model';

@Component({
  selector: 'app-superadmin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class SuperadminDashboardComponent implements OnInit {
  private companyService = inject(CompanyService);
  private userService = inject(UserService);

  companies: Company[] = [];
  totalUsers = 0;
  loading = true;

  async ngOnInit() {
    this.companies = await this.companyService.getAll();
    for (const company of this.companies) {
      const users = await this.userService.getByCompany(company.id);
      this.totalUsers += users.length;
    }
    this.loading = false;
  }
}
```

- [ ] **Step 2: Create superadmin dashboard template**

```html
<!-- src/app/features/superadmin/dashboard/dashboard.component.html -->
<div class="dashboard-container">
  <header class="page-header">
    <h1>Panel de Superadmin</h1>
  </header>

  <div class="stats-grid">
    <div class="stat-card">
      <span class="stat-value">{{ companies.length }}</span>
      <span class="stat-label">Empresas</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{{ totalUsers }}</span>
      <span class="stat-label">Usuarios</span>
    </div>
  </div>

  <div class="quick-actions">
    <h2>Gestión</h2>
    <div class="actions-grid">
      <a routerLink="/sa/companies" class="action-card">
        <span class="icon">🏢</span>
        <span>Empresas</span>
      </a>
      <a routerLink="/sa/users" class="action-card">
        <span class="icon">👥</span>
        <span>Usuarios</span>
      </a>
      <a routerLink="/sa/plans" class="action-card">
        <span class="icon">💳</span>
        <span>Planes</span>
      </a>
    </div>
  </div>
</div>
```

---

## Task 5.2: Create Company Management

**Files:**
- Create: `src/app/features/superadmin/companies/companies.component.ts`
- Create: `src/app/features/superadmin/companies/companies.component.html`
- Create: `src/app/features/superadmin/companies/company-form/company-form.component.ts`
- Create: `src/app/features/superadmin/companies/company-form/company-form.component.html`

**Steps:**

- [ ] **Step 1: Create companies component**

```typescript
// src/app/features/superadmin/companies/companies.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CompanyService } from '../../../core/services/company.service';
import { Company } from '../../../core/models/company.model';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss']
})
export class CompaniesComponent implements OnInit {
  private companyService = inject(CompanyService);

  companies: Company[] = [];
  loading = true;

  async ngOnInit() {
    this.companies = await this.companyService.getAll();
    this.loading = false;
  }
}
```

- [ ] **Step 2: Create companies template**

```html
<!-- src/app/features/superadmin/companies/companies.component.html -->
<div class="companies-container">
  <header class="page-header">
    <h1>Empresas</h1>
    <a routerLink="/sa/companies/new" class="btn btn-primary">Nueva Empresa</a>
  </header>

  <div class="companies-list">
    <div class="company-card" *ngFor="let company of companies">
      <div class="company-logo">
        <img *ngIf="company.logo_url" [src]="company.logo_url" [alt]="company.name">
        <span *ngIf="!company.logo_url">🏢</span>
      </div>
      <div class="company-info">
        <h3>{{ company.name }}</h3>
        <p>{{ company.slug }}</p>
        <p>{{ company.phone }}</p>
      </div>
      <div class="company-actions">
        <a [routerLink]="['/sa/companies', company.id]" class="btn btn-secondary">Editar</a>
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Create company form component**

```typescript
// src/app/features/superadmin/companies/company-form/company-form.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyService } from '../../../../core/services/company.service';
import { PlanService } from '../../../../core/services/plan.service';

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './company-form.component.html',
  styleUrls: ['./company-form.component.scss']
})
export class CompanyFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private companyService = inject(CompanyService);
  private planService = inject(PlanService);

  isEdit = false;
  companyId = '';
  plans: any[] = [];
  loading = false;
  error = '';

  form = this.fb.group({
    name: ['', [Validators.required]],
    slug: ['', [Validators.required]],
    address: [''],
    phone: [''],
    logo_url: [''],
    plan_id: ['']
  });

  async ngOnInit() {
    this.plans = await this.planService.getAll();
    
    this.companyId = this.route.snapshot.paramMap.get('id') || '';
    if (this.companyId && this.companyId !== 'new') {
      this.isEdit = true;
      const company = await this.companyService.getById(this.companyId);
      if (company) {
        this.form.patchValue(company);
      }
    }
  }

  async onSubmit() {
    if (this.form.invalid) return;
    
    this.loading = true;
    try {
      if (this.isEdit) {
        await this.companyService.update(this.companyId, this.form.value as any);
      } else {
        await this.companyService.create(this.form.value as any);
      }
      this.router.navigate(['/sa/companies']);
    } catch (err: any) {
      this.error = err.message;
    }
    this.loading = false;
  }
}
```

- [ ] **Step 4: Create company form template**

```html
<!-- src/app/features/superadmin/companies/company-form/company-form.component.html -->
<div class="form-container">
  <header class="page-header">
    <h1>{{ isEdit ? 'Editar' : 'Nueva' }} Empresa</h1>
  </header>

  <form [formGroup]="form" (ngSubmit)="onSubmit()">
    <div class="form-group">
      <label>Nombre</label>
      <input formControlName="name" type="text">
    </div>
    
    <div class="form-group">
      <label>Slug (URL)</label>
      <input formControlName="slug" type="text" placeholder="mi-empresa">
    </div>
    
    <div class="form-group">
      <label>Dirección</label>
      <input formControlName="address" type="text">
    </div>
    
    <div class="form-group">
      <label>Teléfono</label>
      <input formControlName="phone" type="tel">
    </div>
    
    <div class="form-group">
      <label>URL Logo</label>
      <input formControlName="logo_url" type="url">
    </div>
    
    <div class="form-group">
      <label>Plan</label>
      <select formControlName="plan_id">
        <option value="">Seleccionar plan</option>
        <option *ngFor="let plan of plans" [value]="plan.id">{{ plan.name }} (${{ plan.price }})</option>
      </select>
    </div>

    <div class="error" *ngIf="error">{{ error }}</div>

    <div class="form-actions">
      <button type="button" class="btn btn-secondary" routerLink="/sa/companies">Cancelar</button>
      <button type="submit" class="btn btn-primary" [disabled]="loading">Guardar</button>
    </div>
  </form>
</div>
```

---

## Task 5.3: Create User Management

**Files:**
- Create: `src/app/features/superadmin/users/users.component.ts`
- Create: `src/app/features/superadmin/users/users.component.html`
- Create: `src/app/features/superadmin/users/user-form/user-form.component.ts`
- Create: `src/app/features/superadmin/users/user-form/user-form.component.html`

**Steps:**

- [ ] **Step 1: Create users component**

```typescript
// src/app/features/superadmin/users/users.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { CompanyService } from '../../../core/services/company.service';
import { User } from '../../../core/models/user.model';
import { Company } from '../../../core/models/company.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  private companyService = inject(CompanyService);

  users: (User & { company?: Company })[] = [];
  companies: Company[] = [];
  loading = true;

  async ngOnInit() {
    this.companies = await this.companyService.getAll();
    
    const allUsers: User[] = [];
    for (const company of this.companies) {
      const users = await this.userService.getByCompany(company.id);
      allUsers.push(...users);
    }
    
    this.users = allUsers.map(u => ({
      ...u,
      company: this.companies.find(c => c.id === u.company_id)
    }));
    
    this.loading = false;
  }
}
```

- [ ] **Step 2: Create users template**

```html
<!-- src/app/features/superadmin/users/users.component.html -->
<div class="users-container">
  <header class="page-header">
    <h1>Usuarios</h1>
    <a routerLink="/sa/users/new" class="btn btn-primary">Nuevo Usuario</a>
  </header>

  <div class="users-list">
    <div class="user-card" *ngFor="let user of users">
      <div class="user-photo">
        <img [src]="user.photo_url || '/assets/default-avatar.png'" [alt]="user.full_name">
      </div>
      <div class="user-info">
        <h3>{{ user.full_name }}</h3>
        <p>{{ user.email }}</p>
        <p class="role" [class]="user.role">{{ user.role }}</p>
        <p *ngIf="user.company">{{ user.company.name }}</p>
      </div>
      <div class="user-actions">
        <a [routerLink]="['/sa/users', user.id]" class="btn btn-secondary">Editar</a>
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Create user form component**

```typescript
// src/app/features/superadmin/users/user-form/user-form.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { CompanyService } from '../../../../core/services/company.service';
import { Company } from '../../../../core/models/company.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService);
  private company = inject(UserServiceService = inject(CompanyService);

  isEdit = false;
  userId = '';
  companies: Company[] = [];
  loading = false;
  error = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    full_name: ['', [Validators.required]],
    phone: [''],
    photo_url: [''],
    role: ['employee', [Validators.required]],
    company_id: [''],
    is_active: [true]
  });

  async ngOnInit() {
    this.companies = await this.companyService.getAll();
    
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    if (this.userId && this.userId !== 'new') {
      this.isEdit = true;
      const user = await this.userService.getById(this.userId);
      if (user) {
        this.form.patchValue(user);
      }
    }
  }

  async onSubmit() {
    if (this.form.invalid) return;
    
    this.loading = true;
    try {
      if (this.isEdit) {
        await this.userService.update(this.userId, this.form.value as any);
      } else {
        await this.userService.create(this.form.value as any);
      }
      this.router.navigate(['/sa/users']);
    } catch (err: any) {
      this.error = err.message;
    }
    this.loading = false;
  }
}
```

- [ ] **Step 4: Create user form template**

```html
<!-- src/app/features/superadmin/users/user-form/user-form.component.html -->
<div class="form-container">
  <header class="page-header">
    <h1>{{ isEdit ? 'Editar' : 'Nuevo' }} Usuario</h1>
  </header>

  <form [formGroup]="form" (ngSubmit)="onSubmit()">
    <div class="form-group">
      <label>Email</label>
      <input formControlName="email" type="email">
    </div>
    
    <div class="form-group">
      <label>Nombre Completo</label>
      <input formControlName="full_name" type="text">
    </div>
    
    <div class="form-group">
      <label>Teléfono</label>
      <input formControlName="phone" type="tel">
    </div>
    
    <div class="form-group">
      <label>URL Foto</label>
      <input formControlName="photo_url" type="url">
    </div>
    
    <div class="form-group">
      <label>Rol</label>
      <select formControlName="role">
        <option value="superadmin">Superadmin</option>
        <option value="manager">Manager</option>
        <option value="employee">Empleado</option>
      </select>
    </div>
    
    <div class="form-group">
      <label>Empresa</label>
      <select formControlName="company_id">
        <option value="">Sin empresa</option>
        <option *ngFor="let company of companies" [value]="company.id">{{ company.name }}</option>
      </select>
    </div>
    
    <div class="form-group">
      <label>
        <input type="checkbox" formControlName="is_active"> Activo
      </label>
    </div>

    <div class="error" *ngIf="error">{{ error }}</div>

    <div class="form-actions">
      <button type="button" class="btn btn-secondary" routerLink="/sa/users">Cancelar</button>
      <button type="submit" class="btn btn-primary" [disabled]="loading">Guardar</button>
    </div>
  </form>
</div>
```

---

## Task 5.4: Create Plans Management

**Files:**
- Create: `src/app/features/superadmin/plans/plans.component.ts`
- Create: `src/app/features/superadmin/plans/plans.component.html`

**Steps:**

- [ ] **Step 1: Create PlanService**

```typescript
// src/app/core/services/plan.service.ts
import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { Plan } from '../models/plan.model';

@Injectable({ providedIn: 'root' })
export class PlanService {
  private supabase = inject(SupabaseClient);

  async getAll(): Promise<Plan[]> {
    const { data, error } = await this.supabase
      .from('plans')
      .select('*')
      .order('price');
    
    if (error) throw error;
    return data || [];
  }

  async getById(id: string): Promise<Plan | null> {
    const { data, error } = await this.supabase
      .from('plans')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  }

  async create(plan: Partial<Plan>): Promise<Plan> {
    const { data, error } = await this.supabase
      .from('plans')
      .insert(plan)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async update(id: string, plan: Partial<Plan>): Promise<Plan> {
    const { data, error } = await this.supabase
      .from('plans')
      .update(plan)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}
```

- [ ] **Step 2: Create plans component**

```typescript
// src/app/features/superadmin/plans/plans.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlanService } from '../../../core/services/plan.service';
import { Plan } from '../../../core/models/plan.model';

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.scss']
})
export class PlansComponent implements OnInit {
  private planService = inject(PlanService);

  plans: Plan[] = [];
  loading = true;
  showForm = false;
  editingPlan: Plan | null = null;

  formData = {
    name: '',
    price: 0,
    max_users: 10,
    max_companies: 1
  };

  async ngOnInit() {
    this.plans = await this.planService.getAll();
    this.loading = false;
  }

  openForm(plan?: Plan) {
    if (plan) {
      this.editingPlan = plan;
      this.formData = { ...plan };
    } else {
      this.editingPlan = null;
      this.formData = { name: '', price: 0, max_users: 10, max_companies: 1 };
    }
    this.showForm = true;
  }

  async savePlan() {
    try {
      if (this.editingPlan) {
        await this.planService.update(this.editingPlan.id, this.formData);
      } else {
        await this.planService.create(this.formData);
      }
      this.plans = await this.planService.getAll();
      this.showForm = false;
    } catch (err: any) {
      alert(err.message);
    }
  }
}
```

- [ ] **Step 3: Create plans template**

```html
<!-- src/app/features/superadmin/plans/plans.component.html -->
<div class="plans-container">
  <header class="page-header">
    <h1>Planes</h1>
    <button class="btn btn-primary" (click)="openForm()">Nuevo Plan</button>
  </header>

  <div class="plans-grid">
    <div class="plan-card" *ngFor="let plan of plans">
      <h3>{{ plan.name }}</h3>
      <div class="price">${{ plan.price }}/mes</div>
      <div class="details">
        <p>Usuarios: {{ plan.max_users }}</p>
        <p>Empresas: {{ plan.max_companies }}</p>
      </div>
      <button class="btn btn-secondary" (click)="openForm(plan)">Editar</button>
    </div>
  </div>

  <div class="modal" *ngIf="showForm">
    <div class="modal-content">
      <h2>{{ editingPlan ? 'Editar' : 'Nuevo' }} Plan</h2>
      <div class="form-group">
        <label>Nombre</label>
        <input [(ngModel)]="formData.name" type="text">
      </div>
      <div class="form-group">
        <label>Precio</label>
        <input [(ngModel)]="formData.price" type="number">
      </div>
      <div class="form-group">
        <label>Máx. Usuarios</label>
        <input [(ngModel)]="formData.max_users" type="number">
      </div>
      <div class="form-group">
        <label>Máx. Empresas</label>
        <input [(ngModel)]="formData.max_companies" type="number">
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" (click)="showForm = false">Cancelar</button>
        <button class="btn btn-primary" (click)="savePlan()">Guardar</button>
      </div>
    </div>
  </div>
</div>
```

---

## Task 5.5: Create Superadmin Routes

**Files:**
- Create: `src/app/features/superadmin/superadmin.routes.ts`

**Steps:**

- [ ] **Step 1: Create superadmin routes**

```typescript
// src/app/features/superadmin/superadmin.routes.ts
import { Routes } from '@angular/router';

export const SUPERADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'companies',
    pathMatch: 'full'
  },
  {
    path: 'companies',
    loadComponent: () => import('./companies/companies.component').then(m => m.CompaniesComponent)
  },
  {
    path: 'companies/:id',
    loadComponent: () => import('./companies/company-form/company-form.component').then(m => m.CompanyFormComponent)
  },
  {
    path: 'users',
    loadComponent: () => import('./users/users.component').then(m => m.UsersComponent)
  },
  {
    path: 'users/:id',
    loadComponent: () => import('./users/user-form/user-form.component').then(m => m.UserFormComponent)
  },
  {
    path: 'plans',
    loadComponent: () => import('./plans/plans.component').then(m => m.PlansComponent)
  }
];
```

---

## Phase 5 Summary

| Task | Description | Status |
|------|-------------|--------|
| 5.1 | Create superadmin dashboard | ✅ |
| 5.2 | Implement plans management | ✅ |
| 5.3 | Create company management | ✅ |
| 5.4 | Implement user management | ✅ |
| 5.5 | Create company-plan assignment | ✅ |
| 5.6 | Test superadmin workflow | ✅ |

**Total: ~2 hours**
