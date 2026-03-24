import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
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
  selector: 'app-employee-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    PaginatorModule,
    DatePickerModule,
    ButtonModule,
    TagModule
  ],
  templateUrl: './employee-history.component.html',
  styleUrl: './employee-history.component.scss'
})
export class EmployeeHistoryComponent implements OnInit {
  private authService = inject(AuthService);
  private appointmentService = inject(AppointmentService);

  user = signal<User | null>(null);
  allAppointments = signal<AppointmentWithService[]>([]);
  loading = signal(true);
  error = signal('');

  // Filters
  filterFromDate = signal<Date | null>(null);
  filterToDate = signal<Date | null>(null);

  // Pagination
  currentPage = signal(0);
  pageSize = signal(10);

  filteredAppointments = computed(() => {
    let result = this.allAppointments();
    
    const fromDate = this.filterFromDate();
    const toDate = this.filterToDate();
    
    if (fromDate) {
      const fromStr = fromDate.toISOString().split('T')[0];
      result = result.filter(apt => apt.appointment_date >= fromStr);
    }
    
    if (toDate) {
      const toStr = toDate.toISOString().split('T')[0];
      result = result.filter(apt => apt.appointment_date <= toStr);
    }
    
    return result.sort((a, b) => {
      const dateCompare = b.appointment_date.localeCompare(a.appointment_date);
      if (dateCompare !== 0) return dateCompare;
      return b.appointment_time.localeCompare(a.appointment_time);
    });
  });

  paginatedAppointments = computed(() => {
    const start = this.currentPage() * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredAppointments().slice(start, end);
  });

  totalRecords = computed(() => this.filteredAppointments().length);

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
      const appointments = await this.appointmentService.getCompletedByEmployee(user.id);
      this.allAppointments.set(appointments as AppointmentWithService[]);
    } catch (err) {
      this.error.set('Error al cargar el historial');
    }
  }

  onPageChange(event: any) {
    this.currentPage.set(event.page);
    this.pageSize.set(event.rows);
  }

  applyFilters() {
    this.currentPage.set(0);
  }

  clearFilters() {
    this.filterFromDate.set(null);
    this.filterToDate.set(null);
    this.currentPage.set(0);
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
      month: 'short',
      year: 'numeric'
    });
  }

  formatTime(timeStr: string): string {
    const [hours, minutes] = timeStr.split(':');
    return `${hours}:${minutes}`;
  }
}
