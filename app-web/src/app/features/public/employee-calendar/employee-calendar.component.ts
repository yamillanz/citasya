import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CompanyService } from '../../../core/services/company.service';
import { UserService } from '../../../core/services/user.service';
import { ServiceService } from '../../../core/services/service.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { Company } from '../../../core/models/company.model';
import { User } from '../../../core/models/user.model';
import { Service } from '../../../core/models/service.model';
import { Appointment, calculateTotalDuration, calculateTotalPrice, formatServicesList } from '../../../core/models/appointment.model';
import { AppointmentDetailDialogComponent } from '../../backoffice/employee/history/appointment-detail-dialog.component';

@Component({
  selector: 'app-employee-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FullCalendarModule,
    RouterLink,
    ButtonModule,
    AvatarModule,
    TooltipModule,
    ToastModule,
    AppointmentDetailDialogComponent
  ],
  templateUrl: './employee-calendar.component.html',
  styleUrl: './employee-calendar.component.scss'
})
export class EmployeeCalendarComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private companyService = inject(CompanyService);
  private userService = inject(UserService);
  private serviceService = inject(ServiceService);
  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  company = signal<Company | null>(null);
  employee = signal<User | null>(null);
  services = signal<Service[]>([]);
  selectedDate = signal('');
  availableSlots = signal<string[]>([]);
  selectedServiceIds = signal<string[]>([]);
  selectedTime = signal('');
  loading = signal(true);
  error = signal('');

  pendingAppointments = signal<Appointment[]>([]);
  selectedAppointment = signal<Appointment | null>(null);
  dialogVisible = signal(false);
  cancellingAppointment = signal(false);
  currentUser = signal<User | null>(null);

  canCancel = computed(() => {
    const user = this.currentUser();
    const comp = this.company();
    const emp = this.employee();

    if (!user || !comp || !emp) return false;

    const isEmployee = user.id === emp.id;
    const isManager = user.role === 'manager' && user.company_id === comp.id;

    return isEmployee || isManager;
  });

  // Computed signals for totals
  selectedServices = computed(() => {
    const allServices = this.services();
    const selectedIds = this.selectedServiceIds();
    return allServices.filter(s => selectedIds.includes(s.id));
  });

  totalDuration = computed(() => calculateTotalDuration(this.selectedServices()));

  totalPrice = computed(() => calculateTotalPrice(this.selectedServices()));

  selectedServicesText = computed(() => formatServicesList(this.selectedServices()));

  calendarOptions = computed<CalendarOptions>(() => ({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek'
    },
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    weekends: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    select: this.handleDateSelect.bind(this),
    dateClick: this.handleDateClick.bind(this),
    eventClick: this.handleEventClick.bind(this),
    unselectAuto: false,
    events: this.buildEvents(),
    locale: esLocale,
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana'
    }
  }));

  buildEvents(): EventInput[] {
    return this.pendingAppointments().map(apt => ({
      id: apt.id,
      title: `${apt.appointment_time.substring(0, 5)} - ${apt.client_name}`,
      start: `${apt.appointment_date}T${apt.appointment_time}`,
      backgroundColor: '#F4D03F',
      borderColor: '#F4D03F',
      textColor: '#1a1a1a',
      extendedProps: {
        clientName: apt.client_name,
        clientPhone: apt.client_phone,
        clientEmail: apt.client_email || '',
        status: apt.status,
        amount: apt.amount_collected
      }
    }));
  }

  handleEventClick(arg: any): void {
    const apt = this.pendingAppointments().find(a => a.id === arg.event.id);
    if (apt) {
      this.selectedAppointment.set(apt);
      this.dialogVisible.set(true);
    }
  }

  async ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('companySlug');
    const employeeId = this.route.snapshot.paramMap.get('employeeId');

    if (!slug || !employeeId) {
      this.error.set('Página no encontrada');
      this.loading.set(false);
      return;
    }

    try {
      const company = await this.companyService.getBySlug(slug);
      if (!company) {
        this.error.set('Empresa no encontrada');
        this.loading.set(false);
        return;
      }
      this.company.set(company);

      const employee = await this.userService.getById(employeeId);
      if (!employee) {
        this.error.set('Profesional no encontrado');
        this.loading.set(false);
        return;
      }
      this.employee.set(employee);

      const services = await this.serviceService.getByEmployee(employeeId);
      this.services.set(services);

      this.currentUser.set(await this.authService.getCurrentUser());

      const serviceId = this.route.snapshot.queryParamMap.get('serviceId');
      if (serviceId && services.some(s => s.id === serviceId)) {
        this.selectedServiceIds.update(ids => {
          if (ids.includes(serviceId)) return ids;
          return [...ids, serviceId];
        });
      }

      await this.loadPendingAppointments();
    } catch (err) {
      this.error.set('Error al cargar los datos');
    } finally {
      this.loading.set(false);
    }
  }

  async loadPendingAppointments() {
    const emp = this.employee();
    if (!emp) return;

    try {
      const appointments = await this.appointmentService.getByEmployeeAll(emp.id);
      this.pendingAppointments.set(appointments.filter(a => a.status === 'pending'));
    } catch {
      // silently fail — appointments are optional
    }
  }

  async handleDateSelect(arg: any) {
    this.selectedDate.set(arg.startStr.split('T')[0]);
    this.selectedTime.set('');
    await this.loadAvailableSlots();
  }

  async handleDateClick(arg: any) {
    // arg.dateStr is like "2026-04-06T00:00:00+00:00"
    const dateStr = arg.dateStr;
    const datePart = dateStr.split('T')[0];
    this.selectedDate.set(datePart);
    this.selectedTime.set('');
    await this.loadAvailableSlots();
  }

  async loadAvailableSlots() {
    const duration = this.totalDuration();
    const date = this.selectedDate();
    const emp = this.employee();
    const comp = this.company();

    if (!date || duration === 0 || !emp || !comp) return;

    const slots = await this.appointmentService.getAvailableSlots(
      comp.id,
      emp.id,
      date,
      duration
    );
    this.availableSlots.set(slots);
  }

  onServiceToggle(serviceId: string) {
    const currentIds = this.selectedServiceIds();
    const isSelected = currentIds.includes(serviceId);
    
    if (isSelected) {
      // Remove from selection
      this.selectedServiceIds.set(currentIds.filter(id => id !== serviceId));
    } else {
      // Add to selection
      this.selectedServiceIds.set([...currentIds, serviceId]);
    }
    
    // Clear selected time when services change
    this.selectedTime.set('');
    
    // Reload available slots if date is selected
    if (this.selectedDate() && this.selectedServiceIds().length > 0) {
      this.loadAvailableSlots();
    }
  }

  isServiceSelected(serviceId: string): boolean {
    return this.selectedServiceIds().includes(serviceId);
  }

  selectTime(time: string) {
    this.selectedTime.set(time);
  }

  proceedToBooking() {
    const comp = this.company();
    const emp = this.employee();
    const date = this.selectedDate();
    const time = this.selectedTime();
    const serviceIds = this.selectedServiceIds();

    if (!comp || !emp || serviceIds.length === 0 || !date || !time) {
      return;
    }

    this.router.navigate(['/c', comp.slug, 'e', emp.id, 'book'], {
      queryParams: {
        date: date,
        time: time,
        serviceIds: serviceIds.join(',') // Pass as comma-separated string
      }
    });
  }

  async refreshSlots() {
    if (this.selectedDate() && this.selectedServiceIds().length > 0) {
      this.loading.set(true);
      try {
        await this.loadAvailableSlots();
      } finally {
        this.loading.set(false);
      }
    }
  }

  closeDialog() {
    this.dialogVisible.set(false);
    this.selectedAppointment.set(null);
  }

  async handleCancelAppointment() {
    const apt = this.selectedAppointment();
    if (!apt) return;

    const confirmed = await new Promise<boolean>(resolve => {
      this.confirmationService.confirm({
        message: '¿Cancelar esta cita?',
        header: 'Confirmar cancelación',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sí, cancelar',
        rejectLabel: 'No',
        acceptButtonStyleClass: 'p-button-danger',
        accept: () => resolve(true),
        reject: () => resolve(false)
      });
    });

    if (!confirmed) return;

    this.cancellingAppointment.set(true);
    try {
      await this.appointmentService.cancel(apt.id);
      this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cita cancelada correctamente' });
      await this.loadPendingAppointments();
      this.dialogVisible.set(false);
      this.selectedAppointment.set(null);
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message || 'No se pudo cancelar la cita' });
    } finally {
      this.cancellingAppointment.set(false);
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }
}
