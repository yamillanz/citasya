import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { DrawerModule } from 'primeng/drawer';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AuthService } from '../../../../core/services/auth.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { DailyCloseService } from '../../../../core/services/daily-close.service';
import { CompanyService } from '../../../../core/services/company.service';
import { Appointment, AppointmentStatus } from '../../../../core/models/appointment.model';

interface Employee {
  id: string;
  full_name: string;
}

interface EmployeeStats {
  totalAmount: number;
  totalAppointments: number;
  completedCount: number;
  pendingCount: number;
}

interface DayStats {
  totalAmount: number;
  totalAppointments: number;
  completedCount: number;
  pendingCount: number;
}

interface AppointmentWithRelations extends Appointment {
  employee?: { full_name: string };
  service?: { name: string };
}

@Component({
  selector: 'app-daily-close',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    DatePickerModule,
    TableModule,
    ToastModule,
    InputTextModule,
    DrawerModule,
    InputNumberModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './daily-close.component.html',
  styleUrl: './daily-close.component.scss'
})
export class DailyCloseComponent implements OnInit {
  private authService = inject(AuthService);
  private appointmentService = inject(AppointmentService);
  private dailyCloseService = inject(DailyCloseService);
  private companyService = inject(CompanyService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  appointments = signal<AppointmentWithRelations[]>([]);
  selectedDate = signal<Date>(new Date());
  selectedEmployee = signal<Employee | null>(null);
  searchQuery = signal('');
  loading = signal(true);
  generating = signal(false);
  alreadyClosed = signal(false);
  companyId = signal<string | null>(null);
  companyName = signal('');
  
  amountDrawerVisible = signal(false);
  selectedAppointment = signal<AppointmentWithRelations | null>(null);
  amountInput: number | null = null;

  maxDateValue = new Date();

  employees = computed(() => {
    const empMap = new Map<string, Employee>();
    this.appointments().forEach(apt => {
      if (!empMap.has(apt.employee_id)) {
        empMap.set(apt.employee_id, {
          id: apt.employee_id,
          full_name: apt.employee?.full_name || 'Desconocido'
        });
      }
    });
    return Array.from(empMap.values());
  });

  filteredEmployees = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.employees();
    return this.employees().filter(emp =>
      emp.full_name.toLowerCase().includes(query)
    );
  });

  employeeStats = computed(() => {
    const stats = new Map<string, EmployeeStats>();
    this.appointments().forEach(apt => {
      const empId = apt.employee_id;
      if (!stats.has(empId)) {
        stats.set(empId, {
          totalAmount: 0,
          totalAppointments: 0,
          completedCount: 0,
          pendingCount: 0
        });
      }
      const empStats = stats.get(empId)!;
      empStats.totalAppointments++;
      if (apt.status === 'completed') {
        empStats.completedCount++;
        empStats.totalAmount += apt.amount_collected || 0;
      } else if (apt.status === 'pending') {
        empStats.pendingCount++;
      }
    });
    return stats;
  });

  appointmentsByEmployee = computed(() => {
    const empId = this.selectedEmployee()?.id;
    if (!empId) return [];
    return this.appointments()
      .filter(apt => apt.employee_id === empId)
      .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
  });

  dayStats = computed<DayStats>(() => {
    const apps = this.appointments();
    return {
      totalAmount: apps.reduce((sum, apt) => sum + (apt.status === 'completed' ? (apt.amount_collected || 0) : 0), 0),
      totalAppointments: apps.length,
      completedCount: apps.filter(apt => apt.status === 'completed').length,
      pendingCount: apps.filter(apt => apt.status === 'pending').length
    };
  });

  completedAppointments = computed(() =>
    this.appointments().filter(apt => apt.status === 'completed')
  );

  async ngOnInit() {
    const user = await this.authService.getCurrentUser();
    if (user?.company_id) {
      this.companyId.set(user.company_id);
      await this.loadCompanyName();
      await this.loadAppointments();
    }
    this.loading.set(false);
  }

  async loadCompanyName() {
    if (!this.companyId()) return;
    
    try {
      const company = await this.companyService.getById(this.companyId()!);
      if (company) {
        this.companyName.set(company.name);
      }
    } catch (error) {
      console.error('Error loading company:', error);
    }
  }

  async loadAppointments() {
    if (!this.companyId()) return;
    
    this.loading.set(true);
    try {
      const dateStr = this.formatDateForQuery(this.selectedDate());
      const appointments = await this.appointmentService.getByDate(
        this.companyId()!,
        dateStr
      ) as AppointmentWithRelations[];
      this.appointments.set(appointments);
      
      const isClosed = await this.dailyCloseService.checkIfClosed(
        this.companyId()!,
        dateStr
      );
      this.alreadyClosed.set(isClosed);

      const employees = this.employees();
      if (employees.length > 0 && !this.selectedEmployee()) {
        this.selectedEmployee.set(employees[0]);
      }
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar las citas'
      });
    } finally {
      this.loading.set(false);
    }
  }

  formatDateForQuery(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  selectEmployee(employee: Employee) {
    this.selectedEmployee.set(employee);
  }

  onSearchChange(value: string) {
    this.searchQuery.set(value);
  }

  navigateToPreviousDay() {
    const prev = new Date(this.selectedDate());
    prev.setDate(prev.getDate() - 1);
    this.selectedDate.set(prev);
    this.loadAppointments();
  }

  navigateToNextDay() {
    const next = new Date(this.selectedDate());
    next.setDate(next.getDate() + 1);
    if (next > new Date()) return;
    this.selectedDate.set(next);
    this.loadAppointments();
  }

  onDateChange() {
    this.loadAppointments();
  }

  openCompleteDrawer(appointment: AppointmentWithRelations) {
    this.selectedAppointment.set(appointment);
    this.amountInput = null;
    this.amountDrawerVisible.set(true);
  }

  closeDrawer() {
    this.amountDrawerVisible.set(false);
    this.selectedAppointment.set(null);
    this.amountInput = null;
  }

  async confirmCompletion() {
    const apt = this.selectedAppointment();

    if (!apt) return;
    
    if (this.amountInput === null || this.amountInput === undefined || this.amountInput <= 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El monto debe ser mayor a 0'
      });
      return;
    }

    try {
      await this.appointmentService.updateStatus(apt.id, 'completed', this.amountInput);
      
      this.appointments.update(apps =>
        apps.map(a => a.id === apt.id ? { ...a, status: 'completed' as AppointmentStatus, amount_collected: this.amountInput! } : a)
      );
      
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Cita completada exitosamente'
      });
      
      this.closeDrawer();
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'No se pudo completar la cita'
      });
    }
  }

  markAsNoShow(appointment: AppointmentWithRelations) {
    this.confirmationService.confirm({
      message: '¿Marcar esta cita como "No asistió"?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, marcar',
      rejectLabel: 'Cancelar',
      accept: async () => {
        try {
          await this.appointmentService.updateStatus(appointment.id, 'no_show');
          
          this.appointments.update(apps =>
            apps.map(a => a.id === appointment.id ? { ...a, status: 'no_show' as AppointmentStatus } : a)
          );
          
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Cita marcada como no asistió'
          });
        } catch (error: any) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'No se pudo actualizar la cita'
          });
        }
      }
    });
  }

  cancelAppointment(appointment: AppointmentWithRelations) {
    this.confirmationService.confirm({
      message: '¿Cancelar esta cita?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cancelar',
      rejectLabel: 'No cancelar',
      accept: async () => {
        try {
          await this.appointmentService.updateStatus(appointment.id, 'cancelled');
          
          this.appointments.update(apps =>
            apps.map(a => a.id === appointment.id ? { ...a, status: 'cancelled' as AppointmentStatus } : a)
          );
          
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Cita cancelada'
          });
        } catch (error: any) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'No se pudo cancelar la cita'
          });
        }
      }
    });
  }

  async generateClose() {
    if (this.completedAppointments().length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No hay citas completadas para generar el cierre'
      });
      return;
    }

    this.generating.set(true);

    try {
      const dateStr = this.formatDateForQuery(this.selectedDate());
      await this.dailyCloseService.generateDailyClose(
        this.companyId()!,
        dateStr,
        this.completedAppointments(),
        this.companyName()
      );
      
      this.alreadyClosed.set(true);
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Cierre generado exitosamente. El PDF se ha descargado.'
      });
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'No se pudo generar el cierre'
      });
    } finally {
      this.generating.set(false);
    }
  }

  getEmployeeStats(employeeId: string): EmployeeStats {
    return this.employeeStats().get(employeeId) || {
      totalAmount: 0,
      totalAppointments: 0,
      completedCount: 0,
      pendingCount: 0
    };
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'completed': return 'Completada';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      case 'no_show': return 'No asistió';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    return status;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  formatDateShort(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short'
    });
  }

  getEmployeeNameById(empId: string): string {
    const apt = this.appointments().find(a => a.employee_id === empId);
    return apt?.employee?.full_name || 'Desconocido';
  }

  getInitials(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  isToday(): boolean {
    const today = new Date();
    return this.selectedDate().toDateString() === today.toDateString();
  }

  canNavigateNext(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(this.selectedDate());
    selected.setHours(0, 0, 0, 0);
    return selected < today;
  }
}