import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';

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
  selector: 'app-appointment-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    TagModule,
    CardModule
  ],
  templateUrl: './appointment-detail-dialog.component.html',
  styleUrl: './appointment-detail-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppointmentDetailDialogComponent {
  appointment = input<AppointmentWithService | null>(null);
  visible = input(false);
  currentIndex = input(0);
  totalCount = input(0);
  hasPrevious = input(false);
  hasNext = input(false);

  onClose = output<void>();
  onPrevious = output<void>();
  onNext = output<void>();

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
}