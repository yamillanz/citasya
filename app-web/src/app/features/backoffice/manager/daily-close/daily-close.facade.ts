import { Injectable, inject, signal, computed } from '@angular/core';
import { Appointment, AppointmentStatus } from '../../../../core/models/appointment.model';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { EmailNotificationService } from '../../../../core/services/email-notification.service';
import { DailyCloseService } from '../../../../core/services/daily-close.service';
import { CompanyService } from '../../../../core/services/company.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ServiceService } from '../../../../core/services/service.service';

export interface Employee {
  id: string;
  full_name: string;
}

export interface EmployeeStats {
  totalAmount: number;
  totalAmountBs: number;
  totalAppointments: number;
  completedCount: number;
  pendingCount: number;
}

export interface DayStats {
  totalAmount: number;
  totalAmountBs: number;
  totalAppointments: number;
  completedCount: number;
  pendingCount: number;
}

export interface AppointmentWithRelations extends Appointment {
  employee?: { full_name: string };
  service?: { name: string };
}

export function calculateEmployeeStats(appointments: AppointmentWithRelations[]): Map<string, EmployeeStats> {
  const stats = new Map<string, EmployeeStats>();
  for (const apt of appointments) {
    const empId = apt.employee_id;
    const existing = stats.get(empId);
    if (existing) {
      const updated: EmployeeStats = {
        totalAmount: existing.totalAmount + (apt.status === 'completed' ? (apt.amount_collected || 0) : 0),
        totalAmountBs: existing.totalAmountBs + (apt.status === 'completed' ? (apt.amount_in_bs || 0) : 0),
        totalAppointments: existing.totalAppointments + 1,
        completedCount: existing.completedCount + (apt.status === 'completed' ? 1 : 0),
        pendingCount: existing.pendingCount + (apt.status === 'pending' ? 1 : 0)
      };
      stats.set(empId, updated);
    } else {
      stats.set(empId, {
        totalAmount: apt.status === 'completed' ? (apt.amount_collected || 0) : 0,
        totalAmountBs: apt.status === 'completed' ? (apt.amount_in_bs || 0) : 0,
        totalAppointments: 1,
        completedCount: apt.status === 'completed' ? 1 : 0,
        pendingCount: apt.status === 'pending' ? 1 : 0
      });
    }
  }
  return stats;
}

export function calculateDayStats(appointments: AppointmentWithRelations[]): DayStats {
  let totalAmount = 0;
  let totalAmountBs = 0;
  let totalAppointments = 0;
  let completedCount = 0;
  let pendingCount = 0;
  for (const apt of appointments) {
    totalAppointments++;
    if (apt.status === 'completed') {
      completedCount++;
      totalAmount += apt.amount_collected || 0;
      totalAmountBs += apt.amount_in_bs || 0;
    } else if (apt.status === 'pending') {
      pendingCount++;
    }
  }
  return { totalAmount, totalAmountBs, totalAppointments, completedCount, pendingCount };
}

@Injectable()
export class DailyCloseFacade {
  private appointmentService = inject(AppointmentService);
  private dailyCloseService = inject(DailyCloseService);
  private companyService = inject(CompanyService);
  private authService = inject(AuthService);
  private serviceService = inject(ServiceService);
  private emailNotificationService = inject(EmailNotificationService);

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

  // Computed signals (wrappers)
  readonly employees = computed(() => this.#buildEmployees());
  readonly filteredAppointments = computed(() => this.#buildFilteredAppointments());
  readonly employeeStats = computed(() => calculateEmployeeStats(this._appointments()));
  readonly dayStats = computed(() => calculateDayStats(this._appointments()));
  readonly completedAppointments = computed(() => this.#getCompletedAppointments());
  readonly canNavigateNext = computed(() => this.#checkCanNavigateNext());
  readonly isToday = computed(() => this.#checkIsToday());

  // Private methods
  #buildEmployees(): Employee[] {
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
  }

  #buildFilteredAppointments(): AppointmentWithRelations[] {
    const empId = this._selectedEmployee()?.id;
    if (!empId) return [];
    return this._appointments()
      .filter(apt => apt.employee_id === empId)
      .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
  }

  #getCompletedAppointments(): AppointmentWithRelations[] {
    return this._appointments().filter(apt => apt.status === 'completed');
  }

  #checkCanNavigateNext(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(this._selectedDate());
    selected.setHours(0, 0, 0, 0);
    return selected < today;
  }

  #checkIsToday(): boolean {
    const today = new Date();
    return this._selectedDate().toDateString() === today.toDateString();
  }

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
      
      // Enrich appointments with services if missing (fallback for old data)
      const enriched = await this.enrichAppointmentsWithServices(appointments);
      this._appointments.set(enriched);

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

  private async enrichAppointmentsWithServices(appointments: AppointmentWithRelations[]): Promise<AppointmentWithRelations[]> {
    // Find appointments with empty services
    const appointmentsToEnrich = appointments.filter(apt => !apt.services || apt.services.length === 0);
    if (appointmentsToEnrich.length === 0) return appointments;

    // Load all services for the company once
    let allServices: any[] = [];
    try {
      allServices = await this.serviceService.getByCompany(this._companyId()!);
    } catch (e) {
      console.error('Error loading services for enrichment:', e);
      return appointments;
    }

    const serviceMap = new Map(allServices.map(s => [s.id, s]));

    // Enrich appointments: use service_id as fallback for each appointment
    return appointments.map(apt => {
      if (apt.services && apt.services.length > 0) return apt;
      
      // Fallback: use service_id to get the service from our loaded map
      if (apt.service_id && serviceMap.has(apt.service_id)) {
        const svc = serviceMap.get(apt.service_id);
        return { ...apt, services: [svc] };
      }
      
      return apt;
    }) as AppointmentWithRelations[];
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

  async confirmAppointmentCompletion(appointmentId: string, amount: number, exchangeRate?: number, amountBs?: number, observations?: string, receiptUrl?: string): Promise<void> {
    if (amount <= 0) {
      throw new Error('El monto debe ser mayor a 0');
    }

    await this.appointmentService.updateStatus(appointmentId, 'completed', amount, exchangeRate, amountBs, observations, receiptUrl);

    this._appointments.update(apps =>
      apps.map(a => a.id === appointmentId ? { ...a, status: 'completed' as AppointmentStatus, amount_collected: amount, exchange_rate: exchangeRate, amount_in_bs: amountBs, observations: observations, receipt_url: receiptUrl } : a)
    );
  }

  async markAppointmentAsNoShow(appointmentId: string): Promise<void> {
    await this.appointmentService.updateStatus(appointmentId, 'no_show');

    this._appointments.update(apps =>
      apps.map(a => a.id === appointmentId ? { ...a, status: 'no_show' as AppointmentStatus } : a)
    );

    this.emailNotificationService.notify(appointmentId, 'no_show');
  }

  async cancelAppointment(appointmentId: string): Promise<void> {
    await this.appointmentService.updateStatus(appointmentId, 'cancelled');

    this._appointments.update(apps =>
      apps.map(a => a.id === appointmentId ? { ...a, status: 'cancelled' as AppointmentStatus } : a)
    );

    this.emailNotificationService.notify(appointmentId, 'cancelled');
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
      totalAmountBs: 0,
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
