import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { DrawerModule } from 'primeng/drawer';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../../core/services/auth.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { EmailNotificationService } from '../../../../core/services/email-notification.service';
import { UserService } from '../../../../core/services/user.service';
import { Appointment, AppointmentStatus, calculateTotalDuration, calculateTotalPrice, formatServicesList } from '../../../../core/models/appointment.model';
import { User } from '../../../../core/models/user.model';
import { ManagerAppointmentCreateDialogComponent } from './manager-appointment-create-dialog.component';

interface FilterOption {
  label: string;
  value: string;
}

interface DateGroup {
  date: string;
  appointments: Appointment[];
}

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    SelectModule,
    DatePickerModule,
    InputNumberModule,
    TextareaModule,
    DrawerModule,
    TooltipModule,
    ManagerAppointmentCreateDialogComponent
  ],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppointmentsComponent implements OnInit {
  private authService = inject(AuthService);
  private appointmentService = inject(AppointmentService);
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private emailNotificationService = inject(EmailNotificationService);

  appointments = signal<Appointment[]>([]);
  employees = signal<User[]>([]);
  loading = signal(true);
  companyId = signal<string | null>(null);

  // Filters
  filterEmployee = signal<string>('');
  filterDate = signal<Date | null>(null);
  filterStatus = signal<string>('');
  searchQuery = signal<string>('');
  viewMode = signal<'list' | 'calendar'>('list');

  // Drawer state
  showStatusDialog = signal(false);
  showCreateDialog = signal(false);
  selectedAppointment = signal<Appointment | null>(null);
  statusAction = signal<'completed' | 'cancelled' | 'no_show' | null>(null);
  amountCollected = signal<number>(0);
  exchangeRate = signal<number>(1);
  amountBs = signal<number>(0);
  observations = signal<string>('');
  private lastEdited: 'usd' | 'bs' | null = null;

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

  pendingCount = computed(() => 
    this.filteredAppointments().filter(apt => apt.status === 'pending').length
  );

  completedCount = computed(() => 
    this.filteredAppointments().filter(apt => apt.status === 'completed').length
  );

  cancelledCount = computed(() => 
    this.filteredAppointments().filter(apt => apt.status === 'cancelled' || apt.status === 'no_show').length
  );

  filteredAppointments = computed(() => {
    return this.appointments().filter(apt => {
      if (this.filterEmployee() && apt.employee_id !== this.filterEmployee()) return false;
      if (this.filterStatus() && apt.status !== this.filterStatus()) return false;
      if (this.filterDate()) {
        const fd = this.filterDate()!;
        const filterDateStr = `${fd.getFullYear()}-${String(fd.getMonth() + 1).padStart(2, '0')}-${String(fd.getDate()).padStart(2, '0')}`;
        if (apt.appointment_date !== filterDateStr) return false;
      }
      const query = this.searchQuery().toLowerCase().trim();
      if (query && !apt.client_name.toLowerCase().includes(query)) return false;
      return true;
    });
  });

  groupedAppointments = computed(() => {
    const grouped: { [key: string]: Appointment[] } = {};
    
    this.filteredAppointments()
      .sort((a, b) => {
        const dateCompare = a.appointment_date.localeCompare(b.appointment_date);
        if (dateCompare !== 0) return dateCompare;
        return a.appointment_time.localeCompare(b.appointment_time);
      })
      .forEach(apt => {
        if (!grouped[apt.appointment_date]) {
          grouped[apt.appointment_date] = [];
        }
        grouped[apt.appointment_date].push(apt);
      });
    
    return Object.entries(grouped).map(([date, appointments]) => ({
      date,
      appointments
    }));
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
    
    this.loading.set(true);
    try {
      const [appointments, employees] = await Promise.all([
        this.appointmentService.getByCompany(this.companyId()!),
        this.userService.getByCompany(this.companyId()!)
      ]);
      
      this.appointments.set(appointments);
      this.employees.set(employees.filter(e => e.role === 'employee' || (e.role === 'manager' && e.can_be_employee)));
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los datos'
      });
    } finally {
      this.loading.set(false);
    }
  }

  async refreshData() {
    await this.loadData();
  }

  openCreateDialog() {
    this.showCreateDialog.set(true);
  }

  async handleAppointmentCreated() {
    this.showCreateDialog.set(false);
    await this.loadData();
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  onDateChange() {
    // Filter date is already reactive via ngModel
  }

  clearFilters() {
    this.filterEmployee.set('');
    this.filterDate.set(null);
    this.filterStatus.set('');
    this.searchQuery.set('');
  }

  openStatusDialog(appointment: Appointment, status: AppointmentStatus) {
    this.selectedAppointment.set(appointment);
    this.statusAction.set(status as any);
    this.showStatusDialog.set(true);
    
    if (status === 'completed') {
      this.amountCollected.set(0);
      this.exchangeRate.set(1);
      this.amountBs.set(0);
      this.observations.set('');
      this.lastEdited = null;
    }
  }

  closeDrawer() {
    this.showStatusDialog.set(false);
    this.selectedAppointment.set(null);
    this.statusAction.set(null);
  }

  getDrawerTitle(): string {
    const action = this.statusAction();
    switch (action) {
      case 'completed': return 'Completar Cita';
      case 'cancelled': return 'Cancelar Cita';
      case 'no_show': return 'Marcar como No Asistió';
      default: return 'Actualizar Estado';
    }
  }

  getActionLabel(): string {
    const action = this.statusAction();
    switch (action) {
      case 'completed': return 'Confirmar y Completar';
      case 'cancelled': return 'Sí, Cancelar';
      case 'no_show': return 'Sí, No Asistió';
      default: return 'Aceptar';
    }
  }

  getActionSeverity(): 'success' | 'danger' | 'secondary' {
    const action = this.statusAction();
    switch (action) {
      case 'completed': return 'success';
      case 'cancelled':
      case 'no_show': return 'danger';
      default: return 'secondary';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'completed': return 'pi pi-check-circle';
      case 'cancelled': return 'pi pi-times-circle';
      case 'no_show': return 'pi pi-user-minus';
      default: return 'pi pi-info-circle';
    }
  }

  onUsdChange(value: number | null) {
    if (this.lastEdited === 'bs') return;
    if (value !== null && this.exchangeRate() > 0) {
      this.lastEdited = 'usd';
      this.amountBs.set(parseFloat((value * this.exchangeRate()).toFixed(2)));
      this.lastEdited = null;
    }
  }

  onRateChange(value: number | null) {
    if (this.lastEdited === 'bs') return;
    if (value !== null && this.amountCollected() > 0 && value > 0) {
      this.lastEdited = 'usd';
      this.amountBs.set(parseFloat((this.amountCollected() * value).toFixed(2)));
      this.lastEdited = null;
    }
  }

  onBsChange(value: number | null) {
    if (this.lastEdited === 'usd') return;
    if (value !== null && this.exchangeRate() > 0) {
      this.lastEdited = 'bs';
      this.amountCollected.set(parseFloat((value / this.exchangeRate()).toFixed(2)));
      this.lastEdited = null;
    }
  }

  async confirmStatusChange() {
    const appointment = this.selectedAppointment();
    const action = this.statusAction();
    if (!appointment || !action) return;

    await this.updateStatus(appointment, action);
    this.closeDrawer();
  }

  async updateStatus(appointment: Appointment, status: AppointmentStatus) {
    try {
      const amount = status === 'completed' ? this.amountCollected() : undefined;
      const rate = status === 'completed' ? this.exchangeRate() : undefined;
      const bs = status === 'completed' ? this.amountBs() : undefined;
      const obs = status === 'completed' ? this.observations() : undefined;
      await this.appointmentService.updateStatus(appointment.id, status, amount, rate, bs, obs);

      if (status === 'cancelled' || status === 'no_show') {
        this.emailNotificationService.notify(appointment.id, status);
      }

      const updated = this.appointments().map(apt => 
        apt.id === appointment.id 
          ? { ...apt, status, amount_collected: amount || apt.amount_collected, exchange_rate: rate || apt.exchange_rate, amount_in_bs: bs || apt.amount_in_bs, observations: obs || apt.observations }
          : apt
      );
      this.appointments.set(updated);

      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: `Cita marcada como ${this.getStatusLabel(status).toLowerCase()}`
      });
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

  formatDateShort(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short'
    });
  }

  formatDateFull(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  formatServicesList = formatServicesList;
  calculateTotalDuration = calculateTotalDuration;
  calculateTotalPrice = calculateTotalPrice;
}
