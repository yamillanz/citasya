import { Component, input, output, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

export interface AppointmentWithService {
  id: string;
  company_id: string;
  employee_id: string;
  service_id: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  amount_collected?: number;
  notes?: string;
  cancellation_token?: string;
  created_at: string;
  updated_at: string;
  service?: { name: string };
}

@Component({
  selector: 'app-shared-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FullCalendarModule,
    CardModule,
    TagModule
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

  selectedDayAppointments = computed(() => {
    const date = this.selectedDate();
    if (!date) return [];

    const dateStr = this.formatDateISO(date);
    return this.appointments().filter(
      apt => apt.appointment_date === dateStr
    );
  });

  calendarOptions = computed<CalendarOptions>(() => ({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: this.currentView(),
    locale: esLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek'
    },
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    weekends: true,
    selectable: true,
    dayMaxEvents: true,
    events: this.buildEvents(),
    dateClick: this.handleDateClick.bind(this),
    eventClick: this.handleEventClick.bind(this)
  }));

  buildEvents(): EventInput[] {
    return this.appointments().map(apt => ({
      id: apt.id,
      title: `${apt.appointment_time} - ${apt.client_name}`,
      start: `${apt.appointment_date}T${apt.appointment_time}`,
      backgroundColor: this.getStatusColor(apt.status),
      borderColor: this.getStatusColor(apt.status),
      textColor: '#fff',
      extendedProps: {
        serviceName: apt.service?.name || 'Servicio',
        clientPhone: apt.client_phone,
        clientEmail: apt.client_email || '',
        status: apt.status,
        amount: apt.amount_collected
      }
    }));
  }

  handleDateClick(arg: any) {
    const [year, month, day] = arg.dateStr.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    this.selectedDate.set(localDate);
    this.dateClicked.emit(localDate);
  }

  handleEventClick(arg: any) {
    const appointmentId = arg.event.id;
    const appointment = this.appointments().find(a => a.id === appointmentId);
    if (appointment) {
      this.appointmentClicked.emit(appointment);
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  formatTime(timeStr: string): string {
    const [hours, minutes] = timeStr.split(':');
    return `${hours}:${minutes}`;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed': return '#9DC183';
      case 'pending': return '#F4D03F';
      case 'cancelled': return '#E74C3C';
      case 'no_show': return '#95A5A6';
      default: return '#3498DB';
    }
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'completed': 'Completada',
      'pending': 'Pendiente',
      'cancelled': 'Cancelada',
      'no_show': 'No asistió'
    };
    return labels[status] || status;
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warn';
      case 'cancelled': return 'danger';
      case 'no_show': return 'secondary';
      default: return 'info';
    }
  }

  private formatDateISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
