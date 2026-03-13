# CitasYa - Implementation Plan

## Plan Header

**Project:** CitasYa  
**Goal:** Build a SaaS appointment management system for small businesses (beauty salons, nail salons, massage therapists, dentists)  
**Architecture:** Multi-tenant SaaS with role-based access control (RBAC)  
**Tech Stack:** Angular 20+ (Mobile First), Supabase (Auth, Database, Storage), jsPDF, FullCalendar

---

## 1. Project Overview

CitasYa enables small service businesses to manage appointments without requiring client registration. The system supports public booking links, manager back office, employee self-service views, and superadmin company management.

### Target Users

| Role | Description |
|------|-------------|
| Superadmin | System administrator - manages companies, users, subscription plans |
| Manager | Business owner/manager (1 per company) - full back office access |
| Employee | Staff member - limited to own calendar and history |
| Client | Public user - books appointments without registration |

### Subscription Plans

| Plan | Price | Users | Companies |
|------|-------|-------|-----------|
| Basic | $25/month | 10 (1 Manager + 9 Employees) | 1 |
| Medium | $60/month | 20 (1 Manager + 19 Employees) | 2 |
| Custom | Negotiated | Custom | Custom |

---

## 2. Database Schema (Supabase SQL)

### 2.1 Core Tables

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types
CREATE TYPE user_role AS ENUM ('superadmin', 'manager', 'employee');
CREATE TYPE appointment_status AS ENUM ('pending', 'completed', 'cancelled', 'no_show');

-- Plans table
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    max_users INTEGER NOT NULL,
    max_companies INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    address TEXT,
    phone TEXT,
    logo_url TEXT,
    plan_id UUID REFERENCES plans(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    photo_url TEXT,
    role user_role NOT NULL DEFAULT 'employee',
    company_id UUID REFERENCES companies(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    price DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employee-Services junction table
CREATE TABLE employee_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, service_id)
);

-- Company schedules table
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(company_id, day_of_week)
);

-- Appointments table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES users(id),
    service_id UUID NOT NULL REFERENCES services(id),
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_email TEXT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status appointment_status DEFAULT 'pending',
    amount_collected DECIMAL(10, 2),
    notes TEXT,
    cancellation_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily closes table
CREATE TABLE daily_closes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    close_date DATE NOT NULL,
    total_appointments INTEGER NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    generated_by UUID NOT NULL REFERENCES users(id),
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, close_date)
);
```

### 2.2 Indexes for Performance

```sql
CREATE INDEX idx_appointments_company ON appointments(company_id);
CREATE INDEX idx_appointments_employee ON appointments(employee_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_services_company ON services(company_id);
CREATE INDEX idx_employee_services_employee ON employee_services(employee_id);
CREATE INDEX idx_employee_services_service ON employee_services(service_id);
```

### 2.3 Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_closes ENABLE ROW LEVEL SECURITY;

-- Plans: Everyone can read
CREATE POLICY "plans_select" ON plans
    FOR SELECT USING (true);

-- Companies: Superadmin sees all, Manager sees theirs
CREATE POLICY "companies_select" ON companies
    FOR SELECT USING (
        auth.uid() IN (SELECT id FROM users WHERE role = 'superadmin')
        OR id IN (SELECT company_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "companies_insert" ON companies
    FOR INSERT WITH CHECK (
        auth.uid() IN (SELECT id FROM users WHERE role = 'superadmin')
    );

CREATE POLICY "companies_update" ON companies
    FOR UPDATE USING (
        auth.uid() IN (SELECT id FROM users WHERE role = 'superadmin')
    );

-- Users: Superadmin sees all, Manager sees company users
CREATE POLICY "users_select" ON users
    FOR SELECT USING (
        auth.uid() IN (SELECT id FROM users WHERE role = 'superadmin')
        OR company_id = (SELECT company_id FROM users WHERE id = auth.uid())
        OR id = auth.uid()
    );

CREATE POLICY "users_insert" ON users
    FOR INSERT WITH CHECK (
        auth.uid() IN (SELECT id FROM users WHERE role = 'superadmin')
        OR (
            auth.uid() IN (SELECT id FROM users WHERE role = 'manager')
            AND role = 'employee'
        )
    );

CREATE POLICY "users_update" ON users
    FOR UPDATE USING (
        auth.uid() IN (SELECT id FROM users WHERE role = 'superadmin')
        OR id = auth.uid()
    );

-- Services: Company-based access
CREATE POLICY "services_select" ON services
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
        OR company_id IN (SELECT id FROM companies)
    );

CREATE POLICY "services_insert" ON services
    FOR INSERT WITH CHECK (
        company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "services_update" ON services
    FOR UPDATE USING (
        company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "services_delete" ON services
    FOR DELETE USING (
        company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
    );

-- Employee Services: Company-based access
CREATE POLICY "employee_services_select" ON employee_services
    FOR SELECT USING (
        employee_id = auth.uid()
        OR employee_id IN (SELECT id FROM users WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid()))
    );

CREATE POLICY "employee_services_insert" ON employee_services
    FOR INSERT WITH CHECK (
        employee_id IN (SELECT id FROM users WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid()))
    );

CREATE POLICY "employee_services_delete" ON employee_services
    FOR DELETE USING (
        employee_id IN (SELECT id FROM users WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid()))
    );

-- Schedules: Company-based access
CREATE POLICY "schedules_select" ON schedules
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "schedules_insert" ON schedules
    FOR INSERT WITH CHECK (
        company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "schedules_update" ON schedules
    FOR UPDATE USING (
        company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
    );

-- Appointments: Company and employee access
CREATE POLICY "appointments_select" ON appointments
    FOR SELECT USING (
        company_id = (SELECT company_id FROM users WHERE id = auth.uid())
        OR employee_id = auth.uid()
    );

CREATE POLICY "appointments_insert" ON appointments
    FOR INSERT WITH CHECK (
        company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
        OR company_id IN (SELECT id FROM companies)
    );

CREATE POLICY "appointments_update" ON appointments
    FOR UPDATE USING (
        company_id = (SELECT company_id FROM users WHERE id = auth.uid())
        OR employee_id = auth.uid()
    );

CREATE POLICY "appointments_delete" ON appointments
    FOR DELETE USING (
        company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    );

-- Daily Closes: Manager only
CREATE POLICY "daily_closes_select" ON daily_closes
    FOR SELECT USING (
        company_id = (SELECT company_id FROM users WHERE id = auth.uid())
        AND (SELECT role FROM users WHERE id = auth.uid()) IN ('manager', 'superadmin')
    );

CREATE POLICY "daily_closes_insert" ON daily_closes
    FOR INSERT WITH CHECK (
        company_id = (SELECT company_id FROM users WHERE id = auth.uid())
        AND (SELECT role FROM users WHERE id = auth.uid()) = 'manager'
    );
```

---

## 3. Frontend Architecture (Angular 20+)

### 3.1 Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   ├── manager.guard.ts
│   │   │   ├── employee.guard.ts
│   │   │   └── superadmin.guard.ts
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── company.service.ts
│   │   │   ├── user.service.ts
│   │   │   ├── service.service.ts
│   │   │   ├── appointment.service.ts
│   │   │   ├── schedule.service.ts
│   │   │   └── daily-close.service.ts
│   │   └── models/
│   │       ├── user.model.ts
│   │       ├── company.model.ts
│   │       ├── service.model.ts
│   │       ├── appointment.model.ts
│   │       └── plan.model.ts
│   ├── shared/
│   │   ├── components/
│   │   │   ├── header/
│   │   │   ├── footer/
│   │   │   ├── loading-spinner/
│   │   │   └── confirm-dialog/
│   │   ├── pipes/
│   │   │   └── date-format.pipe.ts
│   │   └── directives/
│   │       └── role.directive.ts
│   ├── features/
│   │   ├── public/
│   │   │   ├── company-list/
│   │   │   ├── employee-calendar/
│   │   │   ├── booking-form/
│   │   │   └── booking-confirmation/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── forgot-password/
│   │   ├── backoffice/
│   │   │   ├── manager/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── employees/
│   │   │   │   ├── services/
│   │   │   │   ├── appointments/
│   │   │   │   ├── calendar/
│   │   │   │   ├── daily-close/
│   │   │   │   └── settings/
│   │   │   └── employee/
│   │   │       ├── my-calendar/
│   │   │       └── my-history/
│   │   └── superadmin/
│   │       ├── companies/
│   │       ├── users/
│   │       └── plans/
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
├── styles/
│   └── styles.scss
└── index.html
```

### 3.2 Routing Configuration

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { managerGuard } from './core/guards/manager.guard';
import { employeeGuard } from './core/guards/employee.guard';
import { superadminGuard } from './core/guards/superadmin.guard';

export const routes: Routes = [
  // Public routes
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'c/:companySlug',
    loadComponent: () => import('./features/public/company-list/company-list.component').then(m => m.CompanyListComponent)
  },
  {
    path: 'c/:companySlug/e/:employeeId',
    loadComponent: () => import('./features/public/employee-calendar/employee-calendar.component').then(m => m.EmployeeCalendarComponent)
  },
  
  // Manager backoffice routes
  {
    path: 'bo',
    canActivate: [authGuard, managerGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/backoffice/manager/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'employees',
        loadComponent: () => import('./features/backoffice/manager/employees/employees.component').then(m => m.EmployeesComponent)
      },
      {
        path: 'employees/:id',
        loadComponent: () => import('./features/backoffice/manager/employees/employee-form/employee-form.component').then(m => m.EmployeeFormComponent)
      },
      {
        path: 'services',
        loadComponent: () => import('./features/backoffice/manager/services/services.component').then(m => m.ServicesComponent)
      },
      {
        path: 'services/:id',
        loadComponent: () => import('./features/backoffice/manager/services/service-form/service-form.component').then(m => m.ServiceFormComponent)
      },
      {
        path: 'appointments',
        loadComponent: () => import('./features/backoffice/manager/appointments/appointments.component').then(m => m.AppointmentsComponent)
      },
      {
        path: 'calendar',
        loadComponent: () => import('./features/backoffice/manager/calendar/calendar.component').then(m => m.CalendarComponent)
      },
      {
        path: 'close',
        loadComponent: () => import('./features/backoffice/manager/daily-close/daily-close.component').then(m => m.DailyCloseComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/backoffice/manager/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  
  // Employee backoffice routes
  {
    path: 'emp',
    canActivate: [authGuard, employeeGuard],
    children: [
      {
        path: 'calendar',
        loadComponent: () => import('./features/backoffice/employee/my-calendar/my-calendar.component').then(m => m.MyCalendarComponent)
      },
      {
        path: 'history',
        loadComponent: () => import('./features/backoffice/employee/my-history/my-history.component').then(m => m.MyHistoryComponent)
      },
      {
        path: '',
        redirectTo: 'calendar',
        pathMatch: 'full'
      }
    ]
  },
  
  // Superadmin routes
  {
    path: 'sa',
    canActivate: [authGuard, superadminGuard],
    children: [
      {
        path: 'companies',
        loadComponent: () => import('./features/superadmin/companies/companies.component').then(m => m.CompaniesComponent)
      },
      {
        path: 'companies/:id',
        loadComponent: () => import('./features/superadmin/companies/company-form/company-form.component').then(m => m.CompanyFormComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/superadmin/users/users.component').then(m => m.UsersComponent)
      },
      {
        path: 'plans',
        loadComponent: () => import('./features/superadmin/plans/plans.component').then(m => m.PlansComponent)
      },
      {
        path: '',
        redirectTo: 'companies',
        pathMatch: 'full'
      }
    ]
  },
  
  // Wildcard route
  {
    path: '**',
    redirectTo: 'login'
  }
];
```

### 3.3 Core Services

```typescript
// auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase = inject(SupabaseClient);
  
  async signIn(email: string, password: string): Promise<User> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data.user;
  }
  
  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
  }
  
  async getCurrentUser(): Promise<User | null> {
    const { data } = await this.supabase.auth.getUser();
    return data.user;
  }
  
  getUserRole(): Observable<UserRole | null> {
    return from(this.supabase.auth.getUser()).pipe(
      map(response => response.data.user),
      switchMap(user => {
        if (!user) return of(null);
        return from(
          this.supabase.from('users').select('role, company_id').eq('id', user.id).single()
        ).pipe(
          map(response => response.data?.role || null)
        );
      })
    );
  }
  
  onAuthStateChange(): Observable<AuthState> {
    return new Observable(observer => {
      this.supabase.auth.onAuthStateChange((event, session) => {
        observer.next({ event, session });
      });
    });
  }
}

// appointment.service.ts
@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private supabase = inject(SupabaseClient);
  
  async getByCompany(companyId: string): Promise<Appointment[]> {
    const { data, error } = await this.supabase
      .from('appointments')
      .select('*, employee:users!employee_id(*), service:services(*)')
      .eq('company_id', companyId)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });
    
    if (error) throw error;
    return data;
  }
  
  async getByEmployee(employeeId: string): Promise<Appointment[]> {
    const { data, error } = await this.supabase
      .from('appointments')
      .select('*, service:services(*)')
      .eq('employee_id', employeeId)
      .order('appointment_date', { ascending: true });
    
    if (error) throw error;
    return data;
  }
  
  async getByDate(companyId: string, date: string): Promise<Appointment[]> {
    const { data, error } = await this.supabase
      .from('appointments')
      .select('*, employee:users!employee_id(full_name), service:services(name)')
      .eq('company_id', companyId)
      .eq('appointment_date', date);
    
    if (error) throw error;
    return data;
  }
  
  async create(appointment: CreateAppointmentDto): Promise<Appointment> {
    const { data, error } = await this.supabase
      .from('appointments')
      .insert({
        ...appointment,
        cancellation_token: crypto.randomUUID()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  async updateStatus(id: string, status: AppointmentStatus, amount?: number): Promise<Appointment> {
    const { data, error } = await this.supabase
      .from('appointments')
      .update({ 
        status, 
        amount_collected: amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  async getAvailableSlots(employeeId: string, date: string, serviceDuration: number): Promise<string[]> {
    const { data: appointments } = await this.supabase
      .from('appointments')
      .select('appointment_time')
      .eq('employee_id', employeeId)
      .eq('appointment_date', date)
      .neq('status', 'cancelled');
    
    const { data: schedule } = await this.supabase
      .from('schedules')
      .select('start_time, end_time')
      .eq('company_id', (await this.getCompanyId(employeeId)))
      .eq('day_of_week', new Date(date).getDay())
      .eq('is_active', true)
      .single();
    
    if (!schedule) return [];
    
    return this.generateAvailableSlots(schedule.start_time, schedule.end_time, appointments || [], serviceDuration);
  }
  
  private generateAvailableSlots(start: string, end: string, appointments: any[], duration: number): string[] {
    const slots: string[] = [];
    let current = this.timeToMinutes(start);
    const endMinutes = this.timeToMinutes(end);
    
    while (current + duration <= endMinutes) {
      const slotTime = this.minutesToTime(current);
      const isOccupied = appointments.some(a => 
        this.timeToMinutes(a.appointment_time) === current
      );
      
      if (!isOccupied) {
        slots.push(slotTime);
      }
      current += duration;
    }
    
    return slots;
  }
  
  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }
  
  private minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }
}
```

---

## 4. Development Phases

### Phase 1: Foundation (Week 1-2)

**Goal:** Set up project infrastructure, database, and authentication

| Task ID | Task Description | Estimated Time | Dependencies |
|---------|-----------------|----------------|--------------|
| 1.1 | Initialize Angular 20+ project with standalone components | 15 min | None |
| 1.2 | Install dependencies: @supabase/supabase-js, @fullcalendar/core, jspdf | 5 min | 1.1 |
| 1.3 | Configure Supabase client with environment variables | 5 min | 1.2 |
| 1.4 | Create database tables (SQL from section 2.1) | 10 min | None |
| 1.5 | Set up RLS policies for all tables | 15 min | 1.4 |
| 1.6 | Create core models (User, Company, Appointment, etc.) | 15 min | None |
| 1.7 | Implement AuthService with Supabase auth | 20 min | 1.3, 1.6 |
| 1.8 | Create auth guards (auth, manager, employee, superadmin) | 15 min | 1.7 |
| 1.9 | Set up global styles with mobile-first approach | 10 min | 1.1 |
| 1.10 | Create login component | 15 min | 1.7, 1.8 |
| 1.11 | Configure routing with lazy loading | 10 min | 1.8 |
| 1.12 | Test authentication flow | 10 min | 1.10 |

**Phase 1 Subtotal:** ~2.5 hours

### Phase 2: Public Booking Portal (Week 2-3)

**Goal:** Allow public access to company/employee calendars and booking

| Task ID | Task Description | Estimated Time | Dependencies |
|---------|-----------------|----------------|--------------|
| 2.1 | Create CompanyService to fetch by slug | 10 min | 1.6 |
| 2.2 | Implement company list page (/c/:slug) | 20 min | 2.1 |
| 2.3 | Create UserService for employee data | 10 min | 1.6 |
| 2.4 | Implement employee calendar page (/c/:slug/e/:id) | 25 min | 2.3 |
| 2.5 | Integrate FullCalendar for date/time selection | 20 min | 2.4 |
| 2.6 | Create booking form component | 15 min | None |
| 2.7 | Implement available slot calculation logic | 20 min | 2.5 |
| 2.8 | Create appointment via public API | 15 min | 1.6, 2.6 |
| 2.9 | Implement booking confirmation page | 10 min | 2.8 |
| 2.10 | Create cancel/reschedule token validation | 15 min | 2.8 |
| 2.11 | Test public booking flow end-to-end | 15 min | 2.9 |

**Phase 2 Subtotal:** ~3 hours

### Phase 3: Manager Back Office (Week 3-5)

**Goal:** Complete management dashboard for business owners

| Task ID | Task Description | Estimated Time | Dependencies |
|---------|-----------------|----------------|--------------|
| 3.1 | Create manager dashboard with today's stats | 20 min | 1.7 |
| 3.2 | Implement services CRUD (ServiceService + UI) | 30 min | 1.6 |
| 3.3 | Create employee management (CRUD) | 30 min | 1.6, 3.2 |
| 3.4 | Implement employee-services assignment UI | 20 min | 3.3 |
| 3.5 | Create appointments list with filters | 25 min | 1.6 |
| 3.6 | Integrate FullCalendar for manager view | 20 min | 3.5 |
| 3.7 | Implement appointment status updates | 15 min | 3.5 |
| 3.8 | Create schedule configuration UI | 20 min | 1.6 |
| 3.9 | Implement company settings (logo, address, etc.) | 15 min | 1.6 |
| 3.10 | Create daily close functionality | 30 min | 3.1 |
| 3.11 | Implement PDF generation with jsPDF | 25 min | 3.10 |
| 3.12 | Save PDF to Supabase Storage | 15 min | 3.11 |
| 3.13 | Test manager workflow end-to-end | 20 min | 3.12 |

**Phase 3 Subtotal:** ~5.5 hours

### Phase 4: Employee Self-Service (Week 5)

**Goal:** Limited view for employees to see their schedule

| Task ID | Task Description | Estimated Time | Dependencies |
|---------|-----------------|----------------|--------------|
| 4.1 | Create employee calendar view | 20 min | 1.6 |
| 4.2 | Implement my appointments list | 15 min | 4.1 |
| 4.3 | Create history view with completed appointments | 15 min | 1.6 |
| 4.4 | Restrict employee access to sensitive data | 10 min | 4.1 |
| 4.5 | Test employee workflow | 10 min | 4.4 |

**Phase 4 Subtotal:** ~1.5 hours

### Phase 5: Superadmin Panel (Week 5-6)

**Goal:** System-wide administration interface

| Task ID | Task Description | Estimated Time | Dependencies |
|---------|-----------------|----------------|--------------|
| 5.1 | Create superadmin dashboard | 15 min | 1.6 |
| 5.2 | Implement plans management (CRUD) | 20 min | 1.6 |
| 5.3 | Create company management (CRUD) | 25 min | 1.6, 5.2 |
| 5.4 | Implement user management with role assignment | 25 min | 1.6, 5.3 |
| 5.5 | Create company-plan assignment | 15 min | 5.3 |
| 5.6 | Test superadmin workflow | 15 min | 5.5 |

**Phase 5 Subtotal:** ~2 hours

### Phase 6: Polish & Production (Week 6-7)

**Goal:** UI improvements, testing, and deployment

| Task ID | Task Description | Estimated Time | Dependencies |
|---------|-----------------|----------------|--------------|
| 6.1 | Mobile responsive testing and fixes | 30 min | All phases |
| 6.2 | Error handling and loading states | 20 min | All phases |
| 6.3 | Add loading spinners and skeleton screens | 15 min | 6.2 |
| 6.4 | Implement form validation | 20 min | All forms |
| 6.5 | Add unit tests for critical services | 45 min | All phases |
| 6.6 | E2E tests for key flows | 30 min | All phases |
| 6.7 | Set up production Supabase project | 10 min | None |
| 6.8 | Configure environment for production | 5 min | 6.7 |
| 6.9 | Deploy Angular app (Vercel/Netlify) | 15 min | 6.8 |
| 6.10 | Final smoke test | 15 min | 6.9 |

**Phase 6 Subtotal:** ~4 hours

---

## 5. File Structure Mapping

### Core Services

| File | Purpose |
|------|---------|
| `src/app/core/services/auth.service.ts` | Authentication with Supabase |
| `src/app/core/services/company.service.ts` | Company CRUD operations |
| `src/app/core/services/user.service.ts` | User/Employee management |
| `src/app/core/services/service.service.ts` | Service CRUD operations |
| `src/app/core/services/appointment.service.ts` | Appointment management + availability |
| `src/app/core/services/schedule.service.ts` | Company schedule management |
| `src/app/core/services/daily-close.service.ts` | Daily close + PDF generation |

### Guards

| File | Purpose |
|------|---------|
| `src/app/core/guards/auth.guard.ts` | Protect authenticated routes |
| `src/app/core/guards/manager.guard.ts` | Manager-only access |
| `src/app/core/guards/employee.guard.ts` | Employee-only access |
| `src/app/core/guards/superadmin.guard.ts` | Superadmin-only access |

### Models

| File | Purpose |
|------|---------|
| `src/app/core/models/user.model.ts` | User interface and types |
| `src/app/core/models/company.model.ts` | Company interface |
| `src/app/core/models/service.model.ts` | Service interface |
| `src/app/core/models/appointment.model.ts` | Appointment interface |
| `src/app/core/models/plan.model.ts` | Subscription plan interface |

### Public Features

| Component | Route | Purpose |
|-----------|-------|---------|
| `CompanyListComponent` | `/c/:slug` | Show employees and services |
| `EmployeeCalendarComponent` | `/c/:slug/e/:id` | Public booking calendar |
| `BookingFormComponent` | Inline | Booking form |
| `BookingConfirmationComponent` | Inline | Booking success |

### Manager Backoffice

| Component | Route | Purpose |
|-----------|-------|---------|
| `DashboardComponent` | `/bo/dashboard` | Daily stats |
| `EmployeesComponent` | `/bo/employees` | Employee list |
| `EmployeeFormComponent` | `/bo/employees/:id` | Add/Edit employee |
| `ServicesComponent` | `/bo/services` | Service list |
| `ServiceFormComponent` | `/bo/services/:id` | Add/Edit service |
| `AppointmentsComponent` | `/bo/appointments` | All appointments |
| `CalendarComponent` | `/bo/calendar` | FullCalendar view |
| `DailyCloseComponent` | `/bo/close` | Generate PDF close |
| `SettingsComponent` | `/bo/settings` | Company settings |

### Employee Backoffice

| Component | Route | Purpose |
|-----------|-------|---------|
| `MyCalendarComponent` | `/emp/calendar` | Personal schedule |
| `MyHistoryComponent` | `/emp/history` | Past appointments |

### Superadmin

| Component | Route | Purpose |
|-----------|-------|---------|
| `CompaniesComponent` | `/sa/companies` | Manage companies |
| `CompanyFormComponent` | `/sa/companies/:id` | Add/Edit company |
| `UsersComponent` | `/sa/users` | Manage users |
| `PlansComponent` | `/sa/plans` | Manage plans |

---

## 6. TDD Approach

### Unit Testing Strategy

For each service and component, follow this pattern:

```typescript
// appointment.service.spec.ts
describe('AppointmentService', () => {
  let service: AppointmentService;
  let mockSupabase: jest.Mocked<SupabaseClient>;
  
  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
      }),
    } as any;
    
    service = new AppointmentService(mockSupabase);
  });
  
  describe('getAvailableSlots', () => {
    it('should return available time slots for given date', async () => {
      // Arrange
      const employeeId = 'emp-123';
      const date = '2026-03-15';
      const duration = 30;
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { start_time: '09:00', end_time: '17:00' }
            })
          })
        })
      } as any);
      
      // Act
      const slots = await service.getAvailableSlots(employeeId, date, duration);
      
      // Assert
      expect(slots).toBeDefined();
      expect(Array.isArray(slots)).toBe(true);
    });
  });
});
```

### Key Test Scenarios

| Service | Test Cases |
|---------|------------|
| AuthService | Sign in, sign out, get current user, role detection |
| AppointmentService | Create, update status, get by company/employee/date, available slots |
| CompanyService | CRUD operations, slug uniqueness |
| ScheduleService | CRUD, day-of-week validation |
| DailyCloseService | Generate PDF, calculate totals, prevent duplicate closes |

---

## 7. Effort Summary by Phase

| Phase | Description | Estimated Effort |
|-------|-------------|------------------|
| 1 | Foundation | 2.5 hours |
| 2 | Public Booking | 3 hours |
| 3 | Manager Back Office | 5.5 hours |
| 4 | Employee Self-Service | 1.5 hours |
| 5 | Superadmin Panel | 2 hours |
| 6 | Polish & Production | 4 hours |
| **Total** | | **~18.5 hours** |

### Effort by Category

| Category | Percentage |
|----------|------------|
| Backend (Supabase) | 25% |
| Frontend Components | 40% |
| Services/Business Logic | 20% |
| Testing | 10% |
| Configuration/Deploy | 5% |

---

## 8. Implementation Notes

### Critical Business Rules

1. **One Manager Per Company**: Enforced at application level when creating users
2. **Plan Limits**: Check max_users before allowing employee creation
3. **Daily Close**: Only one close per day, locks appointments from editing
4. **Public Booking**: No authentication required, generates unique cancellation token

### Security Considerations

1. All API calls use Supabase RLS for data access control
2. JWT tokens managed by Supabase Auth
3. Route guards prevent unauthorized access
4. Cancellation tokens are UUIDs (unguessable)

### Performance Optimizations

1. Lazy loading for all route components
2. Database indexes on frequently queried columns
3. FullCalendar uses virtual scrolling for large datasets
4. OnPush change detection strategy for all components

### Mobile-First Design Principles

1. Touch-friendly tap targets (min 44px)
2. Bottom navigation for primary actions
3. Responsive grids: 1 column mobile, 2 tablet, 3+ desktop
4. Pull-to-refresh on list views

---

## 9. Future Enhancements (Post-MVP)

| Feature | Priority | Description |
|---------|----------|-------------|
| SMS Notifications | Medium | Twilio integration for appointment reminders |
| Email Notifications | Medium | SendGrid integration |
| Recurring Appointments | Low | Weekly/monthly recurring slots |
| Analytics Dashboard | Low | Charts and revenue reports |
| Mobile App | Low | Native iOS/Android apps |
| Multi-company Manager | Low | Manager with access to multiple companies |

---

*Plan created: 2026-03-10*  
*Version: 1.0*  
*Author: Implementation Plan Generator*
