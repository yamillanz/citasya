import { Component, input, output, signal, computed, inject, ChangeDetectionStrategy, effect, model, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { User } from '../../../../core/models/user.model';
import { Service } from '../../../../core/models/service.model';
import { calculateTotalDuration } from '../../../../core/models/appointment.model';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { ServiceService } from '../../../../core/services/service.service';

@Component({
  selector: 'app-manager-appointment-create-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    CheckboxModule
  ],
  templateUrl: './manager-appointment-create-dialog.component.html',
  styleUrl: './manager-appointment-create-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagerAppointmentCreateDialogComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private serviceService = inject(ServiceService);
  private appointmentService = inject(AppointmentService);
  private messageService = inject(MessageService);

  visible = input(false);
  companyId = input('');
  employees = input<User[]>([]);

  onClose = output<void>();
  onCreated = output<void>();

  form: FormGroup = this.fb.group({
    employee_id: [null as string | null, Validators.required],
    service_ids: [[], Validators.required],
    client_name: ['', Validators.required],
    client_phone: ['', Validators.required],
    client_email: ['', Validators.email],
    appointment_time: [null as string | null, Validators.required]
  });

  selectedDate = signal<Date | null>(null);
  dateTouched = signal(false);

  employeeServices = signal<Service[]>([]);
  availableSlots = signal<string[]>([]);
  loadingServices = signal(false);
  loadingSlots = signal(false);
  submitting = signal(false);

  needsScroll = computed(() => this.employeeServices().length > 4);

  selectedServiceIds = model<string[]>([]);

  totalDuration = computed(() => {
    const ids = this.selectedServiceIds();
    if (ids.length === 0) return 0;
    const services = this.employeeServices().filter(s => ids.includes(s.id));
    return calculateTotalDuration(services);
  });

  employeeOptions = computed(() =>
    this.employees().map(emp => ({
      label: emp.full_name,
      value: emp.id
    }))
  );

  minDate = computed(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  formattedDate = computed(() => {
    const d = this.selectedDate();
    if (!d) return '';
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  });

  dateInvalid = computed(() => this.dateTouched() && !this.selectedDate());

  constructor() {
    effect(() => {
      const visible = this.visible();
      if (!visible) return;
      this.resetForm();
    });
  }

  ngOnDestroy() {
    // No subscriptions
  }

  onEmployeeChange(employeeId: string | null) {
    this.form.get('appointment_time')?.reset();
    this.availableSlots.set([]);
    this.form.get('service_ids')?.reset();
    this.selectedServiceIds.set([]);

    if (employeeId) {
      this.loadServices(employeeId);
    } else {
      this.employeeServices.set([]);
    }
  }

  onDateSelect(date: Date) {
    this.selectedDate.set(date);
    this.dateTouched.set(true);
    this.form.get('appointment_time')?.reset();
    this.availableSlots.set([]);

    const employeeId = this.form.get('employee_id')?.value;
    const duration = this.totalDuration();
    if (date && duration > 0 && this.companyId() && employeeId) {
      this.loadSlots(date, duration, employeeId);
    }
  }

  onServiceToggle() {
    this.form.get('appointment_time')?.reset();
    this.availableSlots.set([]);

    const date = this.selectedDate();
    const employeeId = this.form.get('employee_id')?.value;
    const duration = this.totalDuration();

    if (date && duration > 0 && this.companyId() && employeeId) {
      this.loadSlots(date, duration, employeeId);
    }
  }

  async loadServices(employeeId: string) {
    this.loadingServices.set(true);
    try {
      const services = await this.serviceService.getByEmployee(employeeId);
      this.employeeServices.set(services);
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los servicios del empleado'
      });
    } finally {
      this.loadingServices.set(false);
    }
  }

  async loadSlots(date: Date, durationMinutes: number, employeeId: string) {
    if (!date || !durationMinutes || !employeeId || !this.companyId()) return;

    this.loadingSlots.set(true);
    try {
      const dateStr = this.formatDateToStr(date);
      const slots = await this.appointmentService.getAvailableSlots(
        this.companyId(),
        employeeId,
        dateStr,
        durationMinutes
      );
      this.availableSlots.set(slots);
      const currentTime = this.form.get('appointment_time')?.value;
      if (currentTime && !slots.includes(currentTime)) {
        this.form.get('appointment_time')?.reset();
      }
    } catch {
      this.availableSlots.set([]);
    } finally {
      this.loadingSlots.set(false);
    }
  }

  toggleService(serviceId: string) {
    const current = this.selectedServiceIds();
    const updated = current.includes(serviceId)
      ? current.filter(id => id !== serviceId)
      : [...current, serviceId];
    this.selectedServiceIds.set(updated);
    this.form.get('service_ids')?.setValue(updated);
    this.form.get('service_ids')?.markAsTouched();
    this.onServiceToggle();
  }

  isServiceSelected(serviceId: string): boolean {
    return this.selectedServiceIds().includes(serviceId);
  }

  selectTimeSlot(slot: string) {
    this.form.get('appointment_time')?.setValue(slot);
    this.form.get('appointment_time')?.markAsTouched();
  }

  async submit() {
    this.dateTouched.set(true);
    if (!this.selectedDate() || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const time: string = this.form.get('appointment_time')?.value;
    const employeeId: string = this.form.get('employee_id')?.value;

    this.submitting.set(true);
    try {
      await this.appointmentService.create({
        company_id: this.companyId(),
        employee_id: employeeId,
        service_ids: this.form.get('service_ids')?.value,
        client_name: this.form.get('client_name')?.value,
        client_phone: this.form.get('client_phone')?.value || undefined,
        client_email: this.form.get('client_email')?.value || undefined,
        appointment_date: this.formatDateToStr(this.selectedDate()!),
        appointment_time: time
      });

      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Cita creada correctamente'
      });
      this.resetForm();
      this.onCreated.emit();
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'No se pudo crear la cita'
      });
    } finally {
      this.submitting.set(false);
    }
  }

  close() {
    this.resetForm();
    this.onClose.emit();
  }

  private resetForm() {
    this.form.reset({
      employee_id: null,
      service_ids: [],
      client_name: '',
      client_phone: '',
      client_email: '',
      appointment_time: null
    });
    this.selectedDate.set(null);
    this.dateTouched.set(false);
    this.selectedServiceIds.set([]);
    this.employeeServices.set([]);
    this.availableSlots.set([]);
  }

  getTimePlaceholder(): string {
    if (!this.form.get('employee_id')?.value) return 'Selecciona un empleado';
    if (!this.selectedDate()) return 'Selecciona una fecha';
    return 'Selecciona servicios';
  }

  private formatDateToStr(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}