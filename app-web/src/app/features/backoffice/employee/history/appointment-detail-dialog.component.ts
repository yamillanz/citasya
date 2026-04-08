import { Component, input, output, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Service } from '../../../../core/models/service.model';
import { Appointment, calculateTotalDuration, calculateTotalPrice, formatServicesList } from '../../../../core/models/appointment.model';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { ServiceService } from '../../../../core/services/service.service';

type AppointmentWithService = Appointment;

@Component({
  selector: 'app-appointment-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    TagModule,
    CardModule,
    CheckboxModule,
    ToastModule
  ],
  templateUrl: './appointment-detail-dialog.component.html',
  styleUrl: './appointment-detail-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppointmentDetailDialogComponent {
  private appointmentService = inject(AppointmentService);
  private serviceService = inject(ServiceService);
  private messageService = inject(MessageService);

  appointment = input<AppointmentWithService | null>(null);
  visible = input(false);
  currentIndex = input(0);
  totalCount = input(0);
  hasPrevious = input(false);
  hasNext = input(false);

  onClose = output<void>();
  onPrevious = output<void>();
  onNext = output<void>();
  onServicesUpdated = output<void>();

  availableServices = signal<Service[]>([]);
  isEditingServices = signal(false);
  editedServiceIds = signal<string[]>([]);
  savingServices = signal(false);

  totalDuration = computed(() => {
    const apt = this.appointment();
    return apt ? calculateTotalDuration(apt.services || []) : 0;
  });

  totalPrice = computed(() => {
    const apt = this.appointment();
    return apt ? calculateTotalPrice(apt.services || []) : 0;
  });

  canEditServices = computed(() => {
    const apt = this.appointment();
    return apt?.status === 'pending';
  });

  async startEditServices() {
    const apt = this.appointment();
    if (!apt) return;

    try {
      const services = await this.serviceService.getByEmployee(apt.employee_id);
      this.availableServices.set(services);
      this.editedServiceIds.set(apt.services?.map(s => s.id) || []);
      this.isEditingServices.set(true);
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los servicios'
      });
    }
  }

  cancelEditServices() {
    this.isEditingServices.set(false);
    this.editedServiceIds.set([]);
  }

  toggleService(serviceId: string) {
    this.editedServiceIds.update(ids => {
      if (ids.includes(serviceId)) {
        return ids.filter(id => id !== serviceId);
      }
      return [...ids, serviceId];
    });
  }

  isServiceSelected(serviceId: string): boolean {
    return this.editedServiceIds().includes(serviceId);
  }

  async saveServices() {
    const apt = this.appointment();
    if (!apt) return;

    if (this.editedServiceIds().length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debes seleccionar al menos un servicio'
      });
      return;
    }

    this.savingServices.set(true);

    try {
      await this.appointmentService.updateServices(apt.id, this.editedServiceIds());
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Servicios actualizados correctamente'
      });
      this.isEditingServices.set(false);
      this.onServicesUpdated.emit();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron actualizar los servicios'
      });
    } finally {
      this.savingServices.set(false);
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
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  formatTime(timeStr: string): string {
    const [hours, minutes] = timeStr.split(':');
    return `${hours}:${minutes}`;
  }

  formatServicesList = formatServicesList;
  calculateTotalDuration = calculateTotalDuration;
  calculateTotalPrice = calculateTotalPrice;
}