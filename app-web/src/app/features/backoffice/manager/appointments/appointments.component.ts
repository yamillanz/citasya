import { Component, inject, OnInit, OnDestroy, signal, computed, effect, ChangeDetectionStrategy, NgZone, viewChild, ElementRef } from '@angular/core';
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
import { CompanyService } from '../../../../core/services/company.service';
import { EmailNotificationService } from '../../../../core/services/email-notification.service';
import { UserService } from '../../../../core/services/user.service';
import { ExchangeRateStorageService } from '../../../../core/services/exchange-rate-storage.service';
import { StorageService } from '../../../../core/services/storage.service';
import { Appointment, AppointmentStatus, PaymentMethod, calculateTotalDuration, calculateTotalPrice, formatServicesList } from '../../../../core/models/appointment.model';
import { User } from '../../../../core/models/user.model';
import { ManagerAppointmentCreateDialogComponent } from './manager-appointment-create-dialog.component';
import { ImageUploadComponent } from '../../../../shared/components/image-upload/image-upload.component';

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
    ManagerAppointmentCreateDialogComponent,
    ImageUploadComponent
  ],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppointmentsComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private appointmentService = inject(AppointmentService);
  private companyService = inject(CompanyService);
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private emailNotificationService = inject(EmailNotificationService);
  private exchangeRateStorage = inject(ExchangeRateStorageService);
  private storageService = inject(StorageService);
  private zone = inject(NgZone);

  accumulatedAppointments = signal<Appointment[]>([]);
  employees = signal<User[]>([]);
  loading = signal(true);
  companyId = signal<string | null>(null);
  companyName = signal('');

  pageSize = signal(10);
  currentPage = signal(0);
  hasMore = signal(true);
  loadingMore = signal(false);
  totalCount = signal(0);

  // Filters
  filterEmployee = signal<string>('');
  filterDate = signal<Date | null>(null);
  filterStatus = signal<string>('');
  searchQuery = signal<string>('');
  viewMode = signal<'list' | 'calendar'>('list');

  sentinelEl = viewChild<ElementRef<HTMLDivElement>>('sentinel');
  private observer?: IntersectionObserver;
  private searchTimeout?: ReturnType<typeof setTimeout>;

  // Drawer state
  showStatusDialog = signal(false);
  showCreateDialog = signal(false);
  selectedAppointment = signal<Appointment | null>(null);
  statusAction = signal<'completed' | 'cancelled' | 'no_show' | 'paid' | null>(null);
  amountCollected = signal<number>(0);
  exchangeRate = signal<number>(1);
  amountBs = signal<number>(0);
  observations = signal<string>('');
  paymentMethod = signal<PaymentMethod | null>(null);
  paymentReference = signal<string>('');
  paymentAmountBs = signal<number>(0);
  saving = signal(false);
  private lastEdited: 'usd' | 'bs' | null = null;

  selectedCompletionReceipt = signal<File | null>(null);
  completionReceiptError = signal<string | null>(null);
  uploadingCompletionReceipt = signal(false);
  selectedPaymentReceipt = signal<File | null>(null);
  paymentReceiptError = signal<string | null>(null);
  uploadingPaymentReceipt = signal(false);

  paymentMethodOptions = [
    { label: 'Efectivo', value: 'cash' as PaymentMethod },
    { label: 'Transferencia', value: 'transfer' as PaymentMethod },
    { label: 'Pago móvil', value: 'mobile_payment' as PaymentMethod },
    { label: 'Tarjeta', value: 'card' as PaymentMethod },
  ];

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

  constructor() {
    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && this.hasMore() && !this.loadingMore() && !this.loading()) {
            this.zone.run(() => this.loadMore());
          }
        },
        { rootMargin: '100px' }
      );
    });

    effect(() => {
      const el = this.sentinelEl();
      if (el && this.observer) {
        this.observer.disconnect();
        this.observer.observe(el.nativeElement);
      }
    });
  }

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
    return this.accumulatedAppointments();
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
      const company = await this.companyService.getById(user.company_id);
      if (company) {
        this.companyName.set(company.name);
      }
      await this.loadInitialData();
    }
    this.loading.set(false);
  }

  async loadInitialData() {
    if (!this.companyId()) return;

    this.loading.set(true);
    try {
      const employees = await this.userService.getByCompany(this.companyId()!);
      this.employees.set(employees.filter(e => e.role === 'employee' || (e.role === 'manager' && e.can_be_employee)));
    } catch {
      // Employees are non-critical; filters won't populate but appointments still load
    }

    await this.resetAndLoad();
  }

  async resetAndLoad() {
    if (!this.companyId()) return;

    this.currentPage.set(0);
    this.accumulatedAppointments.set([]);
    this.hasMore.set(true);
    this.loading.set(true);
    try {
      const filterDateStr = this.filterDate()
        ? `${this.filterDate()!.getFullYear()}-${String(this.filterDate()!.getMonth() + 1).padStart(2, '0')}-${String(this.filterDate()!.getDate()).padStart(2, '0')}`
        : undefined;

      const result = await this.appointmentService.getByCompanyPaginated({
        companyId: this.companyId()!,
        page: 0,
        pageSize: this.pageSize(),
        status: (this.filterStatus() || undefined) as AppointmentStatus | undefined,
        employeeId: this.filterEmployee() || undefined,
        date: filterDateStr,
        search: this.searchQuery().trim() || undefined,
      });

      this.accumulatedAppointments.set(result.data);
      this.totalCount.set(result.totalCount);
      this.hasMore.set(result.hasMore);
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

  async loadMore() {
    if (!this.hasMore() || this.loadingMore() || this.loading() || !this.companyId()) return;

    const nextPage = this.currentPage() + 1;
    this.loadingMore.set(true);
    try {
      const filterDateStr = this.filterDate()
        ? `${this.filterDate()!.getFullYear()}-${String(this.filterDate()!.getMonth() + 1).padStart(2, '0')}-${String(this.filterDate()!.getDate()).padStart(2, '0')}`
        : undefined;

      const result = await this.appointmentService.getByCompanyPaginated({
        companyId: this.companyId()!,
        page: nextPage,
        pageSize: this.pageSize(),
        status: (this.filterStatus() || undefined) as AppointmentStatus | undefined,
        employeeId: this.filterEmployee() || undefined,
        date: filterDateStr,
        search: this.searchQuery().trim() || undefined,
      });

      this.accumulatedAppointments.update(current => [...current, ...result.data]);
      this.totalCount.set(result.totalCount);
      this.hasMore.set(result.hasMore);
      this.currentPage.set(nextPage);
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar más citas'
      });
    } finally {
      this.loadingMore.set(false);
    }
  }

  async refreshData() {
    await this.resetAndLoad();
  }

  openCreateDialog() {
    this.showCreateDialog.set(true);
  }

  async handleAppointmentCreated() {
    this.showCreateDialog.set(false);
    await this.resetAndLoad();
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);

    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.resetAndLoad();
    }, 300);
  }

  onFilterChange() {
    this.resetAndLoad();
  }

  clearFilters() {
    this.filterEmployee.set('');
    this.filterDate.set(null);
    this.filterStatus.set('');
    this.searchQuery.set('');
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.resetAndLoad();
  }

  openStatusDialog(appointment: Appointment, status: AppointmentStatus) {
    this.selectedAppointment.set(appointment);
    this.statusAction.set(status as any);
    this.showStatusDialog.set(true);
    
    if (status === 'completed') {
      const lastRate = this.exchangeRateStorage.getRate();
      this.amountCollected.set(0);
      this.exchangeRate.set(lastRate);
      this.amountBs.set(0);
      this.observations.set('');
      this.lastEdited = null;
      this.selectedCompletionReceipt.set(null);
      this.completionReceiptError.set(null);
      this.uploadingCompletionReceipt.set(false);
    }
  }

  closeDrawer() {
    this.showStatusDialog.set(false);
    this.selectedAppointment.set(null);
    this.statusAction.set(null);
    this.paymentMethod.set(null);
    this.paymentReference.set('');
    this.paymentAmountBs.set(0);
    this.selectedCompletionReceipt.set(null);
    this.completionReceiptError.set(null);
    this.uploadingCompletionReceipt.set(false);
    this.selectedPaymentReceipt.set(null);
    this.paymentReceiptError.set(null);
    this.uploadingPaymentReceipt.set(false);
  }

  openPaymentDrawer(appointment: Appointment) {
    this.selectedAppointment.set(appointment);
    this.statusAction.set('paid');
    this.showStatusDialog.set(true);
    this.paymentAmountBs.set(appointment.amount_in_bs ?? 0);
    this.paymentMethod.set(null);
    this.paymentReference.set('');
    this.selectedPaymentReceipt.set(null);
    this.paymentReceiptError.set(null);
    this.uploadingPaymentReceipt.set(false);
  }

  async confirmPayment() {
    const appointment = this.selectedAppointment();
    const method = this.paymentMethod();
    if (!appointment || !method) return;

    this.saving.set(true);
    this.uploadingPaymentReceipt.set(true);
    this.paymentReceiptError.set(null);

    let receiptUrl: string | undefined;
    const receiptFile = this.selectedPaymentReceipt();

    if (receiptFile) {
      try {
        receiptUrl = await this.storageService.uploadReceipt(
          receiptFile,
          this.companyId()!,
          appointment.id,
          'payment'
        );
      } catch (error: any) {
        this.paymentReceiptError.set(error.message || 'Error al subir el comprobante. Intente de nuevo.');
        this.saving.set(false);
        this.uploadingPaymentReceipt.set(false);
        return;
      }
    }

    try {
      await this.appointmentService.markAsPaid(appointment.id, {
        payment_method: method,
        payment_reference: this.paymentReference() || undefined,
        payment_amount_bs: this.paymentAmountBs() || undefined,
        payment_receipt_url: receiptUrl,
      });

      const updated = this.accumulatedAppointments().map(apt =>
        apt.id === appointment.id
          ? { ...apt, is_paid: true, payment_method: method, payment_reference: this.paymentReference() || undefined, payment_amount_bs: this.paymentAmountBs() || undefined, payment_date: new Date().toISOString(), payment_receipt_url: receiptUrl }
          : apt
      );
      this.accumulatedAppointments.set(updated);

      this.messageService.add({
        severity: 'success',
        summary: 'Pago registrado',
        detail: `Cita de ${appointment.client_name} marcada como pagada`
      });

      this.closeDrawer();
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo registrar el pago'
      });
    } finally {
      this.saving.set(false);
      this.uploadingPaymentReceipt.set(false);
    }
  }

  getDrawerTitle(): string {
    const action = this.statusAction();
    switch (action) {
      case 'completed': return 'Completar Cita';
      case 'cancelled': return 'Cancelar Cita';
      case 'no_show': return 'Marcar como No Asistió';
      case 'paid': return 'Registrar Pago';
      default: return 'Actualizar Estado';
    }
  }

  getActionLabel(): string {
    const action = this.statusAction();
    switch (action) {
      case 'completed': return 'Confirmar y Completar';
      case 'cancelled': return 'Sí, Cancelar';
      case 'no_show': return 'Sí, No Asistió';
      case 'paid': return 'Confirmar pago';
      default: return 'Aceptar';
    }
  }

  getActionSeverity(): 'success' | 'danger' | 'secondary' {
    const action = this.statusAction();
    switch (action) {
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      case 'no_show': return 'danger';
      case 'paid': return 'success';
      default: return 'secondary';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'completed': return 'pi pi-check-circle';
      case 'cancelled': return 'pi pi-times-circle';
      case 'no_show': return 'pi pi-user-minus';
      case 'paid': return 'pi pi-money-bill';
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
    if (!appointment || !action || action === 'paid') return;

    await this.updateStatus(appointment, action);
    this.closeDrawer();
  }

  async updateStatus(appointment: Appointment, status: AppointmentStatus) {
    try {
      const amount = status === 'completed' ? this.amountCollected() : undefined;
      const rate = status === 'completed' ? this.exchangeRate() : undefined;
      const bs = status === 'completed' ? this.amountBs() : undefined;
      const obs = status === 'completed' ? this.observations() : undefined;

      let receiptUrl: string | undefined;
      if (status === 'completed') {
        this.uploadingCompletionReceipt.set(true);
        this.completionReceiptError.set(null);
        const receiptFile = this.selectedCompletionReceipt();
        if (receiptFile) {
          try {
            receiptUrl = await this.storageService.uploadReceipt(
              receiptFile,
              this.companyId()!,
              appointment.id,
              'completion'
            );
          } catch (error: any) {
            this.completionReceiptError.set(error.message || 'Error al subir el comprobante. Intente de nuevo.');
            this.saving.set(false);
            this.uploadingCompletionReceipt.set(false);
            return;
          }
        }
      }

      await this.appointmentService.updateStatus(appointment.id, status, amount, rate, bs, obs, receiptUrl);

      if (status === 'completed' && rate && rate > 0) {
        this.exchangeRateStorage.setRate(rate);
      }

      if (status === 'cancelled' || status === 'no_show') {
        this.emailNotificationService.notify(appointment.id, status);
      }

      const updated = this.accumulatedAppointments().map(apt => 
        apt.id === appointment.id 
          ? { ...apt, status, amount_collected: amount || apt.amount_collected, exchange_rate: rate || apt.exchange_rate, amount_in_bs: bs || apt.amount_in_bs, observations: obs || apt.observations, receipt_url: receiptUrl }
          : apt
      );
      this.accumulatedAppointments.set(updated);

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
    } finally {
      this.uploadingCompletionReceipt.set(false);
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

  ngOnDestroy() {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.observer?.disconnect();
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
