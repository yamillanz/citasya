import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../../core/services/auth.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { User } from '../../../../core/models/user.model';
import { AppointmentDetailDialogComponent } from './appointment-detail-dialog.component';

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
    TagModule,
    InputTextModule,
    ToastModule,
    AppointmentDetailDialogComponent
  ],
  templateUrl: './employee-history.component.html',
  styleUrl: './employee-history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeHistoryComponent implements OnInit {
  private authService = inject(AuthService);
  private appointmentService = inject(AppointmentService);
  private messageService = inject(MessageService);

  user = signal<User | null>(null);
  allAppointments = signal<AppointmentWithService[]>([]);
  loading = signal(true);
  error = signal('');

  // Filters
  filterFromDate = signal<Date | null>(null);
  filterToDate = signal<Date | null>(null);
  searchQuery = signal('');

  // Sorting
  sortField = signal('appointment_date');
  sortOrder = signal(-1);

  // Pagination
  currentPage = signal(0);
  pageSize = signal(10);

  // Dialog
  selectedAppointment = signal<AppointmentWithService | null>(null);
  dialogVisible = signal(false);
  selectedIndex = signal(0);

  // Exports
  exporting = signal(false);

  filteredAppointments = computed(() => {
    let result = this.allAppointments();
    
    const fromDate = this.filterFromDate();
    const toDate = this.filterToDate();
    const query = this.searchQuery().toLowerCase().trim();
    
    if (fromDate) {
      const fromStr = fromDate.toISOString().split('T')[0];
      result = result.filter(apt => apt.appointment_date >= fromStr);
    }
    
    if (toDate) {
      const toStr = toDate.toISOString().split('T')[0];
      result = result.filter(apt => apt.appointment_date <= toStr);
    }

    if (query) {
      result = result.filter(apt => 
        apt.client_name.toLowerCase().includes(query) ||
        apt.service?.name?.toLowerCase().includes(query) ||
        apt.client_phone.includes(query) ||
        apt.notes?.toLowerCase().includes(query) ||
        apt.client_email?.toLowerCase().includes(query)
      );
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
    this.searchQuery.set('');
    this.currentPage.set(0);
  }

  clearSearch() {
    this.searchQuery.set('');
    this.currentPage.set(0);
  }

  openDetailDialog(appointment: AppointmentWithService) {
    const filtered = this.filteredAppointments();
    const index = filtered.findIndex(a => a.id === appointment.id);
    
    this.selectedAppointment.set(appointment);
    this.selectedIndex.set(index >= 0 ? index : 0);
    this.dialogVisible.set(true);
  }

  closeDialog() {
    this.dialogVisible.set(false);
    this.selectedAppointment.set(null);
  }

  previousAppointment() {
    const filtered = this.filteredAppointments();
    const currentIndex = this.selectedIndex();
    
    if (currentIndex > 0) {
      this.selectedIndex.update(i => i - 1);
      this.selectedAppointment.set(filtered[currentIndex - 1]);
    }
  }

  nextAppointment() {
    const filtered = this.filteredAppointments();
    const currentIndex = this.selectedIndex();
    
    if (currentIndex < filtered.length - 1) {
      this.selectedIndex.update(i => i + 1);
      this.selectedAppointment.set(filtered[currentIndex + 1]);
    }
  }

  exportToCsv() {
    const data = this.filteredAppointments();
    
    if (data.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin datos',
        detail: 'No hay datos para exportar'
      });
      return;
    }

    this.exporting.set(true);

    const headers = ['Fecha', 'Hora', 'Cliente', 'Teléfono', 'Email', 'Servicio', 'Estado', 'Monto', 'Notas'];
    
    const rows = data.map(apt => [
      this.formatDate(apt.appointment_date),
      this.formatTime(apt.appointment_time),
      apt.client_name,
      apt.client_phone,
      apt.client_email || '',
      apt.service?.name || 'N/A',
      this.getStatusLabel(apt.status),
      apt.amount_collected ? `$${apt.amount_collected}` : '-',
      apt.notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `historial-citas-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.exporting.set(false);
    this.messageService.add({
      severity: 'success',
      summary: 'Exportación exitosa',
      detail: `Se exportaron ${data.length} citas`
    });
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
