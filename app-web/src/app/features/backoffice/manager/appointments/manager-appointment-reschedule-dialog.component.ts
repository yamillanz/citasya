import { Component, ChangeDetectionStrategy, computed, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';
import { Appointment, calculateTotalDuration } from '../../../../core/models/appointment.model';
import { AppointmentService } from '../../../../core/services/appointment.service';

@Component({
  selector: 'app-manager-appointment-reschedule-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    DatePickerModule
  ],
  templateUrl: './manager-appointment-reschedule-dialog.component.html',
  styleUrl: './manager-appointment-reschedule-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagerAppointmentRescheduleDialogComponent {
  private appointmentService = inject(AppointmentService);
  private messageService = inject(MessageService);

  visible = input(false);
  appointment = input<Appointment | null>(null);

  onClose = output<void>();
  onRescheduled = output<void>();

  selectedDate = signal<Date | null>(null);
  availableSlots = signal<string[]>([]);
  loadingSlots = signal(false);
  submitting = signal(false);
  selectedTime = signal('');

  minDate: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  totalDuration = computed(() => calculateTotalDuration(this.appointment()?.services || []));

  canConfirm = computed(() =>
    !!this.selectedDate() && !!this.selectedTime() && !this.submitting() && !this.loadingSlots()
  );

  constructor() {
    effect(() => {
      const apt = this.appointment();
      const visible = this.visible();
      if (!visible || !apt) return;

      this.selectedDate.set(this.parseDate(apt.appointment_date));
      this.selectedTime.set(apt.appointment_time.substring(0, 5));
      this.availableSlots.set([]);
      this.loadSlots(apt.appointment_date);
    });
  }

  async onDateSelect(date: Date): Promise<void> {
    this.selectedDate.set(date);
    this.selectedTime.set('');
    this.availableSlots.set([]);

    const apt = this.appointment();
    if (!date || !apt) return;
    await this.loadSlots(this.formatDateToStr(date));
  }

  async loadSlots(dateStr: string): Promise<void> {
    const apt = this.appointment();
    if (!apt || !apt.company_id || !apt.employee_id) return;

    this.loadingSlots.set(true);
    try {
      const slots = await this.appointmentService.getAvailableSlots(
        apt.company_id,
        apt.employee_id,
        dateStr,
        this.totalDuration() || 30,
        apt.id
      );
      this.availableSlots.set(slots);
    } catch {
      this.availableSlots.set([]);
    } finally {
      this.loadingSlots.set(false);
    }
  }

  selectTimeSlot(slot: string): void {
    this.selectedTime.set(slot);
  }

  async submit(): Promise<void> {
    const apt = this.appointment();
    const date = this.selectedDate();
    const time = this.selectedTime();

    if (!apt || !date || !time) return;

    this.submitting.set(true);
    try {
      await this.appointmentService.reschedule(apt.id, this.formatDateToStr(date), time);
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Cita reprogramada correctamente'
      });
      this.onRescheduled.emit();
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error?.message || 'El horario ya no está disponible'
      });
    } finally {
      this.submitting.set(false);
    }
  }

  close(): void {
    this.resetState();
    this.onClose.emit();
  }

  private resetState(): void {
    this.selectedDate.set(null);
    this.selectedTime.set('');
    this.availableSlots.set([]);
    this.loadingSlots.set(false);
    this.submitting.set(false);
  }

  private parseDate(dateStr: string): Date {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  private formatDateToStr(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
