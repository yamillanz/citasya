# Spec: SharedCalendarComponent - Requirements

## Overview

Componente reutilizable de calendario que muestra citas en vistas mensual y semanal, con una lista de citas detalladas debajo del calendario.

## Component Location

`src/app/shared/components/calendar/`

## File Structure

```
calendar/
├── calendar.component.ts       # Componente principal
├── calendar.component.html     # Template
├── calendar.component.scss     # Estilos
└── calendar.component.spec.ts  # Tests
```

## Inputs (Angular signals)

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `appointments` | `Signal<AppointmentWithService[]>` | `signal([])` | Lista de citas a mostrar |
| `initialView` | `'dayGridMonth' \| 'timeGridWeek'` | `'dayGridMonth'` | Vista inicial del calendario |

## Outputs

| Output | Type | Description |
|--------|------|-------------|
| `appointmentClicked` | `Output<AppointmentWithService>` | Emitido cuando usuario clickea una cita |
| `dateClicked` | `Output<Date>` | Emitido cuando usuario clickea un día |

## Data Model

```typescript
interface AppointmentWithService {
  id: string;
  company_id: string;
  employee_id: string;
  service_id: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  appointment_date: string;  // YYYY-MM-DD
  appointment_time: string;   // HH:mm
  status: 'pending' | 'completed' | 'cancelled' | 'no_show';
  amount_collected?: number;
  notes?: string;
  service?: { name: string };
}
```

## UI Requirements

### Layout

```
┌─────────────────────────────────────────────┐
│  [Mes] [Semana]          ◀ Marzo 2026 ▶    │
├─────────────────────────────────────────────┤
│                                             │
│           FULLCALENDAR                       │
│      (vista seleccionada)                   │
│                                             │
├─────────────────────────────────────────────┤
│  Citas del [fecha seleccionada]             │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐   │
│  │ 🕐 10:00  María García - Corte     │   │
│  │    ▓▓▓▓▓ (borde: color estado)     │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ 🕐 11:30  Carlos López - Manicure   │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Visual States

1. **Sin día seleccionado**: Mensaje "Selecciona un día para ver sus citas"
2. **Día sin citas**: Mensaje "No hay citas para este día" con icono `pi-calendar-times`
3. **Con citas**: Lista de citas con borde izquierdo de color según estado

### Status Colors (bordes)

| Status | Color | Border |
|--------|-------|--------|
| completed | `#9DC183` | Verde salvia |
| pending | `#F4D03F` | Amarillo |
| cancelled | `#E74C3C` | Rojo |
| no_show | `#95A5A6` | Gris |

## Behavior

### Interactions

1. **Click en día (vista mes)**: Selecciona el día, filtra y muestra citas en lista inferior
2. **Click en cita**: Emite `appointmentClicked` con la cita completa
3. **Toggle vista**: Cambia entre `dayGridMonth` y `timeGridWeek`
4. **Navegación calendario**: Flechas prev/next para cambiar mes/semana

### FullCalendar Configuration

```typescript
calendarOptions = {
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: this.initialView(),
  headerToolbar: false,  // Usamos header custom
  slotMinTime: '08:00:00',
  slotMaxTime: '20:00:00',
  weekends: true,
  selectable: true,
  dayMaxEvents: true,
  events: this.buildEvents(),
  dateClick: this.handleDateClick.bind(this),
  eventClick: this.handleEventClick.bind(this)
};
```

## Technical Requirements

- Angular standalone component
- ChangeDetectionStrategy.OnPush
- Signal-based inputs/outputs (Angular 17.2+)
- FullCalendar 6.x con plugins dayGrid, timeGrid, interaction
- PrimeNG para estilos base (no crear componentes nuevos)
- SCSS con variables CSS del proyecto

## Dependencies

```typescript
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CardModule } from 'primeng/card';
```
