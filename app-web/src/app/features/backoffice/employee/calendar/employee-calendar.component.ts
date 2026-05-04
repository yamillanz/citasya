import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthService } from '../../../../core/services/auth.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { CompanyService } from '../../../../core/services/company.service';
import { User } from '../../../../core/models/user.model';
import { Appointment } from '../../../../core/models/appointment.model';
import { SharedCalendarComponent, AppointmentWithService } from '../../../../shared/components/calendar/calendar.component';
import { AppointmentDetailDialogComponent } from '../../../backoffice/employee/history/appointment-detail-dialog.component';
import { AppointmentCreateDialogComponent } from './appointment-create-dialog.component';

@Component({
  selector: 'app-employee-calendar',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    TagModule,
    ButtonModule,
    TooltipModule,
    ToastModule,
    SharedCalendarComponent,
    AppointmentDetailDialogComponent,
    AppointmentCreateDialogComponent
  ],
  templateUrl: './employee-calendar.component.html',
  styleUrl: './employee-calendar.component.scss'
})
export class EmployeeCalendarComponent implements OnInit {
  private authService = inject(AuthService);
  private appointmentService = inject(AppointmentService);
  private companyService = inject(CompanyService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  user = signal<User | null>(null);
  appointments = signal<Appointment[]>([]);
  loading = signal(true);
  error = signal('');
  copying = signal(false);

  showDetailsDialog = signal(false);
  selectedAppointment = signal<Appointment | null>(null);
  cancellingAppointment = signal(false);
  showCreateDialog = signal(false);

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

    this.loading.set(true);
    try {
      const appointments = await this.appointmentService.getByEmployeeAll(user.id);
      this.appointments.set(appointments);
    } catch (err) {
      this.error.set('Error al cargar las citas');
    } finally {
      this.loading.set(false);
    }
  }

  get calendarAppointments(): AppointmentWithService[] {
    return this.appointments() as AppointmentWithService[];
  }

  async refreshData() {
    await this.loadAppointments();
  }

  onAppointmentClick(apt: AppointmentWithService) {
    this.selectedAppointment.set(apt as unknown as Appointment);
    this.showDetailsDialog.set(true);
  }

  closeDetailsDialog() {
    this.showDetailsDialog.set(false);
    this.selectedAppointment.set(null);
  }

  openCreateDialog() {
    this.showCreateDialog.set(true);
  }

  handleAppointmentCreated() {
    this.showCreateDialog.set(false);
    this.refreshData();
  }

  async handleCancelAppointment() {
    const apt = this.selectedAppointment();
    if (!apt) return;

    const confirmed = await new Promise<boolean>(resolve => {
      this.confirmationService.confirm({
        message: '¿Cancelar esta cita?',
        header: 'Confirmar cancelación',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sí, cancelar',
        rejectLabel: 'No',
        acceptButtonStyleClass: 'p-button-danger',
        accept: () => resolve(true),
        reject: () => resolve(false)
      });
    });

    if (!confirmed) return;

    this.cancellingAppointment.set(true);
    try {
      await this.appointmentService.cancel(apt.id);
      this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cita cancelada correctamente' });
      await this.loadAppointments();
      this.closeDetailsDialog();
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message || 'No se pudo cancelar la cita' });
    } finally {
      this.cancellingAppointment.set(false);
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

  async copyBookingLink() {
    const user = this.user();
    if (!user?.company_id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo obtener la información de la empresa'
      });
      return;
    }

    this.copying.set(true);
    try {
      const company = await this.companyService.getById(user.company_id);
      if (!company?.slug) {
        throw new Error('Company slug not found');
      }

      const bookingUrl = `${window.location.origin}/c/${company.slug}/e/${user.id}`;
      await navigator.clipboard.writeText(bookingUrl);

      this.messageService.add({
        severity: 'success',
        summary: 'Link copiado',
        detail: 'El cliente podrá ver tu calendario y seleccionar servicio, fecha y hora',
        life: 5000
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo copiar el link. Por favor intenta de nuevo.'
      });
    } finally {
      this.copying.set(false);
    }
  }
}
