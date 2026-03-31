import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../../core/services/auth.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { User } from '../../../../core/models/user.model';
import { SharedCalendarComponent, AppointmentWithService } from '../../../../shared/components/calendar/calendar.component';

@Component({
  selector: 'app-employee-calendar',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    TagModule,
    ButtonModule,
    SharedCalendarComponent
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
    } catch (err) {
      this.error.set('Error al cargar las citas');
    }
  }

  onAppointmentClick(apt: AppointmentWithService) {
    this.selectedAppointment.set(apt);
    this.showDetailsDialog.set(true);
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
