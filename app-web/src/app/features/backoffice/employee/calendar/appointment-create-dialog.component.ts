import { Component, input, output, signal, computed, inject, ChangeDetectionStrategy, effect, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Service } from '../../../../core/models/service.model';
import { calculateTotalDuration } from '../../../../core/models/appointment.model';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { ServiceService } from '../../../../core/services/service.service';

@Component({
  selector: 'app-appointment-create-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    CheckboxModule,
    ToastModule
  ],
  templateUrl: './appointment-create-dialog.component.html',
  styleUrl: './appointment-create-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppointmentCreateDialogComponent {
  private fb = inject(FormBuilder);
  private serviceService = inject(ServiceService);
  private appointmentService = inject(AppointmentService);
  private messageService = inject(MessageService);

  visible = input(false);
  employeeId = input('');
  companyId = input('');
  date = input<Date | null>(null);

  onClose = output<void>();
  onCreated = output<void>();

  form: FormGroup = this.fb.group({
    service_ids: [[], Validators.required],
    client_name: ['', Validators.required],
    client_phone: [''],
    client_email: ['', Validators.email],
    appointment_time: [null as string | null, Validators.required]
  });

  employeeServices = signal<Service[]>([]);
  availableSlots = signal<string[]>([]);
  loadingServices = signal(false);
  loadingSlots = signal(false);
  submitting = signal(false);

  needsScroll = computed(() => this.employeeServices().length > 4);

  formattedDate = computed(() => {
    const d = this.date();
    if (!d) return '';
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  });

  selectedServiceIds = model<string[]>([]);

  totalDuration = computed(() => {
    const ids = this.selectedServiceIds();
    if (ids.length === 0) return 0;
    const services = this.employeeServices().filter(s => ids.includes(s.id));
    return calculateTotalDuration(services);
  });

  constructor() {
    effect(() => {
      if (this.visible() && this.employeeId()) {
        this.loadServices();
      }
    });

    effect(() => {
      const date = this.date();
      const duration = this.totalDuration();
      if (date && duration > 0 && this.companyId() && this.employeeId()) {
        this.loadSlots(date, duration);
      } else {
        this.availableSlots.set([]);
        this.form.get('appointment_time')?.reset();
      }
    });
  }

  async loadServices() {
    this.loadingServices.set(true);
    try {
      const services = await this.serviceService.getByEmployee(this.employeeId());
      this.employeeServices.set(services);
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los servicios'
      });
      this.onClose.emit();
    } finally {
      this.loadingServices.set(false);
    }
  }

  async loadSlots(date: Date, durationMinutes: number) {
    this.loadingSlots.set(true);
    try {
      const dateStr = this.formatDateToStr(date);
      const slots = await this.appointmentService.getAvailableSlots(
        this.companyId(),
        this.employeeId(),
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
  }

  isServiceSelected(serviceId: string): boolean {
    return this.selectedServiceIds().includes(serviceId);
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const date = this.date();
    if (!date) return;

    const time: string = this.form.get('appointment_time')?.value;

    this.submitting.set(true);
    try {
      await this.appointmentService.create({
        company_id: this.companyId(),
        employee_id: this.employeeId(),
        service_ids: this.form.get('service_ids')?.value,
        client_name: this.form.get('client_name')?.value,
        client_phone: this.form.get('client_phone')?.value || undefined,
        client_email: this.form.get('client_email')?.value || undefined,
        appointment_date: this.formatDateToStr(date),
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
      service_ids: [],
      client_name: '',
      client_phone: '',
      client_email: '',
      appointment_time: null
    });
    this.selectedServiceIds.set([]);
    this.availableSlots.set([]);
  }

  private formatDateToStr(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
