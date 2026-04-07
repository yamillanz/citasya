import { Injectable, inject, signal, computed } from '@angular/core';
import { Appointment, AppointmentStatus } from '../../../../core/models/appointment.model';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { DailyCloseService } from '../../../../core/services/daily-close.service';
import { CompanyService } from '../../../../core/services/company.service';
import { AuthService } from '../../../../core/services/auth.service';

export interface Employee {
  id: string;
  full_name: string;
}

export interface EmployeeStats {
  totalAmount: number;
  totalAppointments: number;
  completedCount: number;
  pendingCount: number;
}

export interface DayStats {
  totalAmount: number;
  totalAppointments: number;
  completedCount: number;
  pendingCount: number;
}

export interface AppointmentWithRelations extends Appointment {
  employee?: { full_name: string };
  service?: { name: string };
}

@Injectable()
export class DailyCloseFacade {
  private appointmentService = inject(AppointmentService);
  private dailyCloseService = inject(DailyCloseService);
  private companyService = inject(CompanyService);
  private authService = inject(AuthService);

  // State signals
  private readonly _appointments = signal<AppointmentWithRelations[]>([]);
  private readonly _selectedDate = signal<Date>(new Date());
  private readonly _selectedEmployee = signal<Employee | null>(null);
  private readonly _companyId = signal<string | null>(null);
  private readonly _companyName = signal('');
  private readonly _loading = signal(false);
  private readonly _generating = signal(false);
  private readonly _alreadyClosed = signal(false);
  private readonly _amountInput = signal<number | null>(null);

  // Public readonly signals
  readonly appointments = this._appointments.asReadonly();
  readonly selectedDate = this._selectedDate.asReadonly();
  readonly selectedEmployee = this._selectedEmployee.asReadonly();
  readonly companyId = this._companyId.asReadonly();
  readonly companyName = this._companyName.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly generating = this._generating.asReadonly();
  readonly alreadyClosed = this._alreadyClosed.asReadonly();
  readonly amountInput = this._amountInput.asReadonly();

  // Computed signals
  readonly employees = computed(() => {
    const empMap = new Map<string, Employee>();
    this._appointments().forEach(apt => {
      if (!empMap.has(apt.employee_id)) {
        empMap.set(apt.employee_id, {
          id: apt.employee_id,
          full_name: apt.employee?.full_name || 'Desconocido'
        });
      }
    });
    return Array.from(empMap.values());
  });

  readonly filteredAppointments = computed(() => {
    const empId = this._selectedEmployee()?.id;
    if (!empId) return [];
    return this._appointments()
      .filter(apt => apt.employee_id === empId)
      .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
  });

  readonly employeeStats = computed(() => {
    const stats = new Map<string, EmployeeStats>();
    this._appointments().forEach(apt => {
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

  readonly dayStats = computed<DayStats>(() => {
    const apps = this._appointments();
    return {
      totalAmount: apps.reduce((sum, apt) => sum + (apt.status === 'completed' ? (apt.amount_collected || 0) : 0), 0),
      totalAppointments: apps.length,
      completedCount: apps.filter(apt => apt.status === 'completed').length,
      pendingCount: apps.filter(apt => apt.status === 'pending').length
    };
  });

  readonly completedAppointments = computed(() =>
    this._appointments().filter(apt => apt.status === 'completed')
  );

  readonly canNavigateNext = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(this._selectedDate());
    selected.setHours(0, 0, 0, 0);
    return selected < today;
  });

  readonly isToday = computed(() => {
    const today = new Date();
    return this._selectedDate().toDateString() === today.toDateString();
  });

  async initialize(): Promise<void> {
    const user = await this.authService.getCurrentUser();
    if (user?.company_id) {
      this._companyId.set(user.company_id);
      await this.loadCompanyName();
      await this.loadAppointments();
    }
    this._loading.set(false);
  }

  async loadCompanyName(): Promise<void> {
    if (!this._companyId()) return;

    try {
      const company = await this.companyService.getById(this._companyId()!);
      if (company) {
        this._companyName.set(company.name);
      }
    } catch (error) {
      console.error('Error loading company:', error);
    }
  }

  async loadAppointments(): Promise<void> {
    if (!this._companyId()) return;

    this._loading.set(true);
    try {
      const dateStr = this.formatDateForQuery(this._selectedDate());
      const appointments = await this.appointmentService.getByDate(
        this._companyId()!,
        dateStr
      ) as AppointmentWithRelations[];
      this._appointments.set(appointments);

      const isClosed = await this.dailyCloseService.checkIfClosed(
        this._companyId()!,
        dateStr
      );
      this._alreadyClosed.set(isClosed);

      const employees = this.employees();
      if (employees.length > 0 && !this._selectedEmployee()) {
        this._selectedEmployee.set(employees[0]);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  selectEmployee(employee: Employee | null): void {
    this._selectedEmployee.set(employee);
  }

  navigateToPreviousDay(): void {
    const prev = new Date(this._selectedDate());
    prev.setDate(prev.getDate() - 1);
    this._selectedDate.set(prev);
    this.loadAppointments();
  }

  navigateToNextDay(): void {
    const next = new Date(this._selectedDate());
    next.setDate(next.getDate() + 1);
    if (next > new Date()) return;
    this._selectedDate.set(next);
    this.loadAppointments();
  }

  onDateChange(date: Date): void {
    this._selectedDate.set(date);
    this.loadAppointments();
  }

  setAmountInput(amount: number | null): void {
    this._amountInput.set(amount);
  }

  async confirmAppointmentCompletion(appointmentId: string, amount: number): Promise<void> {
    if (amount <= 0) {
      throw new Error('El monto debe ser mayor a 0');
    }

    await this.appointmentService.updateStatus(appointmentId, 'completed', amount);

    this._appointments.update(apps =>
      apps.map(a => a.id === appointmentId ? { ...a, status: 'completed' as AppointmentStatus, amount_collected: amount } : a)
    );
  }

  async markAppointmentAsNoShow(appointmentId: string): Promise<void> {
    await this.appointmentService.updateStatus(appointmentId, 'no_show');

    this._appointments.update(apps =>
      apps.map(a => a.id === appointmentId ? { ...a, status: 'no_show' as AppointmentStatus } : a)
    );
  }

  async cancelAppointment(appointmentId: string): Promise<void> {
    await this.appointmentService.updateStatus(appointmentId, 'cancelled');

    this._appointments.update(apps =>
      apps.map(a => a.id === appointmentId ? { ...a, status: 'cancelled' as AppointmentStatus } : a)
    );
  }

  async generateDailyClose(): Promise<void> {
    if (this.completedAppointments().length === 0) {
      throw new Error('No hay citas completadas para generar el cierre');
    }

    this._generating.set(true);

    try {
      const dateStr = this.formatDateForQuery(this._selectedDate());
      await this.dailyCloseService.generateDailyClose(
        this._companyId()!,
        dateStr,
        this.completedAppointments(),
        this._companyName()
      );

      this._alreadyClosed.set(true);
    } finally {
      this._generating.set(false);
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

  getEmployeeNameById(empId: string): string {
    const apt = this._appointments().find(a => a.employee_id === empId);
    return apt?.employee?.full_name || 'Desconocido';
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

  formatDateForQuery(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getInitials(name: string): string {
    return name.charAt(0).toUpperCase();
  }
}
