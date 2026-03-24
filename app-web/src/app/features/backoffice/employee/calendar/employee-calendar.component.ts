import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../../core/services/auth.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { User } from '../../../../core/models/user.model';

interface AppointmentWithService {
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
  selector: 'app-employee-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FullCalendarModule,
    CardModule,
    DialogModule,
    TagModule,
    ButtonModule
  ],
  templateUrl: './employee-calendar.component.html',
  styleUrl: './employee-calendar.component.scss'
})
export class EmployeeCalendarComponent implements OnInit {
  private authService = inject(AuthService);
  private appointmentService = inject(AppointmentService);

  user = signal<User | null>(null);
  appointments = signal<AppointmentWithService[]>([]);
  loading = signal(true);
  error = signal('');

  showDetailsDialog = signal(false);
  selectedAppointment = signal<AppointmentWithService | null>(null);

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    weekends: true,
    selectable: false,
    dayMaxEvents: true,
    events: [],
    eventClick: this.handleEventClick.bind(this),
    datesSet: this.handleDatesSet.bind(this)
  };

  async ngOnInit() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      this.user.set(user);
      await this.loadAppointments();
    } else {
      this.error.set('No se pudo obtener la información del usuario');
    }
    this.loading.set(false);
  }

  async loadAppointments() {
    const user = this.user();
    if (!user) return;

    try {
      const appointments = await this.appointmentService.getByEmployeeAll(user.id);
      this.appointments.set(appointments as AppointmentWithService[]);
      this.updateCalendarEvents();
    } catch (err) {
      this.error.set('Error al cargar las citas');
    }
  }

  handleDatesSet(arg: any) {
    // This is called when the calendar date range changes
    // We could filter events here if needed for performance
  }

  handleEventClick(arg: any) {
    const appointmentId = arg.event.id;
    const appointment = this.appointments().find(a => a.id === appointmentId);
    if (appointment) {
      this.selectedAppointment.set(appointment);
      this.showDetailsDialog.set(true);
    }
  }

  updateCalendarEvents() {
    const events: EventInput[] = this.appointments().map(apt => ({
      id: apt.id,
      title: `${apt.appointment_time} - ${apt.client_name}`,
      start: `${apt.appointment_date}T${apt.appointment_time}`,
      backgroundColor: this.getStatusColor(apt.status),
      borderColor: this.getStatusColor(apt.status),
      textColor: '#fff',
      extendedProps: {
        serviceName: (apt as AppointmentWithService).service?.name || 'Servicio',
        clientPhone: apt.client_phone,
        clientEmail: apt.client_email || '',
        status: apt.status,
        amount: apt.amount_collected
      }
    }));

    this.calendarOptions = {
      ...this.calendarOptions,
      events
    };
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

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
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
}
