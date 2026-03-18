import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TagModule } from 'primeng/tag';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../../core/services/auth.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { UserService } from '../../../../core/services/user.service';
import { Appointment, AppointmentStatus } from '../../../../core/models/appointment.model';
import { User } from '../../../../core/models/user.model';

interface FilterOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    DropdownModule,
    CalendarModule,
    TagModule,
    InputNumberModule,
    DialogModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.scss'
})
export class AppointmentsComponent implements OnInit {
  private authService = inject(AuthService);
  private appointmentService = inject(AppointmentService);
  private userService = inject(UserService);
  private messageService = inject(MessageService);

  appointments = signal<Appointment[]>([]);
  employees = signal<User[]>([]);
  loading = signal(true);
  companyId = signal<string | null>(null);

  // Filters
  filterEmployee = signal<string>('');
  filterDate = signal<Date | null>(null);
  filterStatus = signal<string>('');

  // Status update dialog
  showStatusDialog = signal(false);
  selectedAppointment = signal<Appointment | null>(null);
  amountCollected = signal<number>(0);

  statusOptions: FilterOption[] = [
    { label: 'Todos los estados', value: '' },
    { label: 'Pendiente', value: 'pending' },
    { label: 'Completada', value: 'completed' },
    { label: 'Cancelada', value: 'cancelled' },
    { label: 'No asistió', value: 'no_show' }
  ];

  employeeOptions = computed<FilterOption[]>(() => [
    { label: 'Todos los empleados', value: '' },
    ...this.employees().map(emp => ({
      label: emp.full_name,
      value: emp.id
    }))
  ]);

  filteredAppointments = computed(() => {
    return this.appointments().filter(apt => {
      if (this.filterEmployee() && apt.employee_id !== this.filterEmployee()) return false;
      if (this.filterStatus() && apt.status !== this.filterStatus()) return false;
      if (this.filterDate()) {
        const filterDateStr = this.filterDate()!.toISOString().split('T')[0];
        if (apt.appointment_date !== filterDateStr) return false;
      }
      return true;
    });
  });

  async ngOnInit() {
    const user = await this.authService.getCurrentUser();
    if (user?.company_id) {
      this.companyId.set(user.company_id);
      await this.loadData();
    }
    this.loading.set(false);
  }

  async loadData() {
    if (!this.companyId()) return;
    
    try {
      const [appointments, employees] = await Promise.all([
        this.appointmentService.getByCompany(this.companyId()!),
        this.userService.getByCompany(this.companyId()!)
      ]);
      
      this.appointments.set(appointments);
      this.employees.set(employees.filter(e => e.role === 'employee'));
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los datos'
      });
    }
  }

  openStatusDialog(appointment: Appointment, status: AppointmentStatus) {
    this.selectedAppointment.set(appointment);
    this.showStatusDialog.set(true);
    
    if (status === 'completed') {
      this.amountCollected.set(0);
    }
  }

  async updateStatus(status: AppointmentStatus) {
    const appointment = this.selectedAppointment();
    if (!appointment) return;

    try {
      const amount = status === 'completed' ? this.amountCollected() : undefined;
      await this.appointmentService.updateStatus(appointment.id, status, amount);
      
      // Update local state
      const updated = this.appointments().map(apt => 
        apt.id === appointment.id 
          ? { ...apt, status, amount_collected: amount || apt.amount_collected }
          : apt
      );
      this.appointments.set(updated);

      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: `Cita marcada como ${this.getStatusLabel(status).toLowerCase()}`
      });

      this.showStatusDialog.set(false);
      this.selectedAppointment.set(null);
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo actualizar el estado'
      });
    }
  }

  getStatusSeverity(status: AppointmentStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warn';
      case 'cancelled': return 'danger';
      case 'no_show': return 'secondary';
      default: return 'info';
    }
  }

  getStatusLabel(status: AppointmentStatus): string {
    const labels: { [key in AppointmentStatus]: string } = {
      'completed': 'Completada',
      'pending': 'Pendiente',
      'cancelled': 'Cancelada',
      'no_show': 'No asistió'
    };
    return labels[status] || status;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}
