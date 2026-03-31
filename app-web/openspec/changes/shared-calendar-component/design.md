# Design: SharedCalendarComponent

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    EmployeeCalendarPage                      │
│  (maneja carga de datos, auth, estado de loading/error)     │
└─────────────────────┬───────────────────────────────────────┘
                      │ appointments (signal)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  SharedCalendarComponent                     │
│           (presentación, sin lógica de negocio)             │
└─────────────────────────────────────────────────────────────┘
```

## Component API

### Inputs

```typescript
@Component({
  selector: 'app-shared-calendar',
  // ...
})
export class SharedCalendarComponent {
  appointments = input<AppointmentWithService[]>([]);
  initialView = input<'dayGridMonth' | 'timeGridWeek'>('dayGridMonth');
  
  appointmentClicked = output<AppointmentWithService>();
  dateClicked = output<Date>();
}
```

### Uso en template

```html
<app-shared-calendar
  [appointments]="appointments"
  [initialView]="'dayGridMonth'"
  (appointmentClicked)="onAppointmentClick($event)"
  (dateClicked)="onDateClick($event)"
/>
```

## Implementation Details

### Calendar Component (TypeScript)

```typescript
@Component({
  selector: 'app-shared-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FullCalendarModule,
    CardModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class SharedCalendarComponent {
  appointments = input<AppointmentWithService[]>([]);
  initialView = input<'dayGridMonth' | 'timeGridWeek'>('dayGridMonth');
  
  appointmentClicked = output<AppointmentWithService>();
  dateClicked = output<Date>();
  
  selectedDate = signal<Date | null>(null);
  currentView = signal<'dayGridMonth' | 'timeGridWeek'>('dayGridMonth');
  
  calendarOptions = computed(() => ({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: this.currentView(),
    headerToolbar: false,
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    weekends: true,
    selectable: true,
    dayMaxEvents: true,
    events: this.buildEvents(),
    dateClick: this.handleDateClick.bind(this),
    eventClick: this.handleEventClick.bind(this)
  }));
  
  selectedDayAppointments = computed(() => {
    const date = this.selectedDate();
    if (!date) return [];
    
    const dateStr = this.formatDateISO(date);
    return this.appointments().filter(
      apt => apt.appointment_date === dateStr
    );
  });
}
```

### Template Structure

```html
<div class="shared-calendar">
  <!-- Header con toggles de vista -->
  <div class="calendar-header">
    <div class="view-toggles">
      <button 
        [class.active]="currentView() === 'dayGridMonth'"
        (click)="currentView.set('dayGridMonth')">
        Mes
      </button>
      <button 
        [class.active]="currentView() === 'timeGridWeek'"
        (click)="currentView.set('timeGridWeek')">
        Semana
      </button>
    </div>
    
    <full-calendar [options]="calendarOptions()" />
  </div>
  
  <!-- Lista de citas -->
  <div class="appointments-list">
    <h3>
      @if (selectedDate()) {
        Citas del {{ formatDate(selectedDate()!) }}
      } @else {
        Selecciona un día para ver sus citas
      }
    </h3>
    
    @if (selectedDayAppointments().length === 0 && selectedDate()) {
      <p class="no-appointments">
        <i class="pi pi-calendar-times"></i>
        No hay citas para este día
      </p>
    }
    
    @for (apt of selectedDayAppointments(); track apt.id) {
      <div 
        class="appointment-card"
        [class]="'status-' + apt.status"
        (click)="appointmentClicked.emit(apt)">
        <span class="apt-time">{{ apt.appointment_time }}</span>
        <span class="apt-info">
          {{ apt.client_name }} - {{ apt.service?.name || 'Servicio' }}
        </span>
      </div>
    }
  </div>
</div>
```

### SCSS Structure

```scss
.shared-calendar {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.calendar-header {
  .view-toggles {
    display: flex;
    gap: var(--space-sm);
    margin-bottom: var(--space-md);
    
    button {
      padding: var(--space-sm) var(--space-lg);
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
      background: white;
      cursor: pointer;
      
      &.active {
        background: var(--color-sage);
        color: white;
        border-color: var(--color-sage);
      }
    }
  }
}

.appointments-list {
  h3 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: var(--space-md);
  }
}

.appointment-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--color-linen);
  border-radius: var(--radius-md);
  border-left: 4px solid;
  margin-bottom: var(--space-sm);
  cursor: pointer;
  
  &.status-completed { border-left-color: #9DC183; }
  &.status-pending { border-left-color: #F4D03F; }
  &.status-cancelled { border-left-color: #E74C3C; }
  &.status-no_show { border-left-color: #95A5A6; }
  
  &:hover {
    transform: translateX(4px);
    transition: transform var(--duration-fast);
  }
}
```

## Refactoring EmployeeCalendarComponent

El `EmployeeCalendarComponent` actual se simplificará a:

1. Manejar auth y carga de datos
2. Pasar appointments al `SharedCalendarComponent`
3. Escuchar eventos de click
4. Mostrar diálogo de detalles al clickear cita (mantiene el diálogo actual)

```typescript
// EmployeeCalendarComponent (simplificado)
@Component({...})
export class EmployeeCalendarComponent implements OnInit {
  private authService = inject(AuthService);
  private appointmentService = inject(AppointmentService);
  
  user = signal<User | null>(null);
  appointments = signal<AppointmentWithService[]>([]);
  loading = signal(true);
  
  showDetailsDialog = signal(false);
  selectedAppointment = signal<AppointmentWithService | null>(null);
  
  async ngOnInit() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      this.user.set(user);
      await this.loadAppointments();
    }
    this.loading.set(false);
  }
  
  async loadAppointments() {
    const user = this.user();
    if (!user) return;
    const appointments = await this.appointmentService.getByEmployeeAll(user.id);
    this.appointments.set(appointments as AppointmentWithService[]);
  }
  
  onAppointmentClick(apt: AppointmentWithService) {
    this.selectedAppointment.set(apt);
    this.showDetailsDialog.set(true);
  }
}
```

## Files to Create

1. `shared/components/calendar/calendar.component.ts`
2. `shared/components/calendar/calendar.component.html`
3. `shared/components/calendar/calendar.component.scss`
4. `shared/components/calendar/calendar.component.spec.ts`

## Files to Modify

1. `employee/calendar/employee-calendar.component.ts` - usar SharedCalendarComponent
2. `employee/calendar/employee-calendar.component.html` - simplificar
3. `employee/calendar/employee-calendar.component.scss` - puede que no necesite cambios

## Testing Strategy

1. Unit tests para el componente:
   - Verificar que se muestra el calendario
   - Verificar que las citas se filtran por día seleccionado
   - Verificar que se emiten los eventos de output
   - Verificar los diferentes estados (sin día, sin citas)
