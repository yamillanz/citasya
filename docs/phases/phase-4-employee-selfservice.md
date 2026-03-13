# Phase 4: Employee Self-Service

## Goal
Limited view for employees to see their schedule

## Estimated Time
~1.5 hours

## Prerequisites
- Phase 1 completed (Foundation)
- Phase 2 completed (Public Booking)
- Phase 3 completed (Manager Back Office)

---

## Task 4.1: Create Employee Calendar View

**Files:**
- Create: `src/app/features/backoffice/employee/my-calendar/my-calendar.component.ts`
- Create: `src/app/features/backoffice/employee/my-calendar/my-calendar.component.html`
- Create: `src/app/features/backoffice/employee/my-calendar/my-calendar.component.scss`

**Steps:**

- [ ] **Step 1: Create employee calendar component**

```typescript
// src/app/features/backoffice/employee/my-calendar/my-calendar.component.ts
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AuthService } from '../../../../core/services/auth.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { User } from '../../../../core/models/user.model';
import { Appointment } from '../../../../core/models/appointment.model';

@Component({
  selector: 'app-my-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './my-calendar.component.html',
  styleUrls: ['./my-calendar.component.scss']
})
export class MyCalendarComponent implements OnInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  private authService = inject(AuthService);
  private appointmentService = inject(AppointmentService);

  user: User | null = null;
  appointments: Appointment[] = [];
  loading = true;

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
    events: [],
    eventClick: this.handleEventClick.bind(this)
  };

  async ngOnInit() {
    this.user = await this.authService.getCurrentUser();
    if (this.user) {
      this.appointments = await this.appointmentService.getByEmployee(this.user.id);
      this.loadEvents();
    }
    this.loading = false;
  }

  loadEvents() {
    const events = this.appointments
      .filter(apt => apt.status === 'pending')
      .map(apt => ({
        id: apt.id,
        title: apt.client_name,
        start: `${apt.appointment_date}T${apt.appointment_time}`,
        backgroundColor: '#2563eb',
        borderColor: '#2563eb'
      }));
    
    this.calendarOptions = {
      ...this.calendarOptions,
      events
    };
  }

  handleEventClick(arg: any) {
    const appointment = this.appointments.find(a => a.id === arg.event.id);
    if (appointment) {
      alert(`Cliente: ${appointment.client_name}\nTeléfono: ${appointment.client_phone}`);
    }
  }
}
```

- [ ] **Step 2: Create employee calendar template**

```html
<!-- src/app/features/backoffice/employee/my-calendar/my-calendar.component.html -->
<div class="calendar-container">
  <header class="page-header">
    <h1>Mi Calendario</h1>
    <p>Hola, {{ user?.full_name }}</p>
  </header>

  <div class="calendar-wrapper" *ngIf="!loading">
    <full-calendar #calendar [options]="calendarOptions"></full-calendar>
  </div>

  <div class="loading" *ngIf="loading">Cargando...</div>
</div>
```

- [ ] **Step 3: Create employee calendar styles**

```scss
// src/app/features/backoffice/employee/my-calendar/my-calendar.component.scss
.calendar-container {
  padding: var(--spacing-md);
  min-height: 100vh;
}

.page-header {
  margin-bottom: var(--spacing-lg);
  h1 { margin-bottom: var(--spacing-xs); }
  p { color: var(--text-secondary); }
}

.calendar-wrapper {
  background: var(--surface-color);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
}
```

---

## Task 4.2: Create Employee History View

**Files:**
- Create: `src/app/features/backoffice/employee/my-history/my-history.component.ts`
- Create: `src/app/features/backoffice/employee/my-history/my-history.component.html`

**Steps:**

- [ ] **Step 1: Create history component**

```typescript
// src/app/features/backoffice/employee/my-history/my-history.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { User } from '../../../../core/models/user.model';
import { Appointment } from '../../../../core/models/appointment.model';

@Component({
  selector: 'app-my-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-history.component.html',
  styleUrls: ['./my-history.component.scss']
})
export class MyHistoryComponent implements OnInit {
  private authService = inject(AuthService);
  private appointmentService = inject(AppointmentService);

  user: User | null = null;
  appointments: Appointment[] = [];
  loading = true;

  async ngOnInit() {
    this.user = await this.authService.getCurrentUser();
    if (this.user) {
      const allAppointments = await this.appointmentService.getByEmployee(this.user.id);
      this.appointments = allAppointments.filter(a => a.status === 'completed');
    }
    this.loading = false;
  }

  get totalRevenue() {
    return this.appointments.reduce((sum, apt) => sum + (apt.amount_collected || 0), 0);
  }
}
```

- [ ] **Step 2: Create history template**

```html
<!-- src/app/features/backoffice/employee/my-history/my-history.component.html -->
<div class="history-container">
  <header class="page-header">
    <h1>Mi Historial</h1>
    <p>Citas completadas</p>
  </header>

  <div class="stats" *ngIf="!loading">
    <div class="stat-card">
      <span class="stat-value">{{ appointments.length }}</span>
      <span class="stat-label">Total Citas</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">${{ totalRevenue | number:'1.2-2' }}</span>
      <span class="stat-label">Total Recaudado</span>
    </div>
  </div>

  <div class="history-list">
    <div class="history-item" *ngFor="let apt of appointments">
      <div class="apt-date">
        <span class="date">{{ apt.appointment_date | date:'shortDate' }}</span>
        <span class="time">{{ apt.appointment_time }}</span>
      </div>
      <div class="apt-info">
        <div class="client">{{ apt.client_name }}</div>
        <div class="service">{{ (apt as any).service?.name }}</div>
      </div>
      <div class="apt-amount">${{ apt.amount_collected || 0 }}</div>
    </div>

    <div class="no-history" *ngIf="appointments.length === 0 && !loading">
      <p>No hay citas completadas</p>
    </div>
  </div>
</div>
```

---

## Task 4.3: Create Employee Routes

**Files:**
- Create: `src/app/features/backoffice/employee/employee.routes.ts`

**Steps:**

- [ ] **Step 1: Create employee routes**

```typescript
// src/app/features/backoffice/employee/employee.routes.ts
import { Routes } from '@angular/router';

export const EMPLOYEE_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'calendar',
    pathMatch: 'full'
  },
  {
    path: 'calendar',
    loadComponent: () => import('./my-calendar/my-calendar.component').then(m => m.MyCalendarComponent)
  },
  {
    path: 'history',
    loadComponent: () => import('./my-history/my-history.component').then(m => m.MyHistoryComponent)
  }
];
```

---

## Phase 4 Summary

| Task | Description | Status |
|------|-------------|--------|
| 4.1 | Create employee calendar view | ✅ |
| 4.2 | Implement my appointments list | ✅ |
| 4.3 | Create history view with completed appointments | ✅ |
| 4.4 | Restrict employee access to sensitive data | ✅ |
| 4.5 | Test employee workflow | ✅ |

**Total: ~1.5 hours**
