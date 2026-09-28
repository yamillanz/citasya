import { Component, ChangeDetectionStrategy, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { AppointmentService } from '../../../core/services/appointment.service';
import { EmailNotificationService } from '../../../core/services/email-notification.service';
import { PrimeNGConfirmationDialog } from '../../../core/services/primeng-confirmation-dialog.service';

export interface AppointmentByToken {
  id: string;
  company_id: string;
  employee_id: string;
  client_name: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes?: string | null;
  company_name: string;
  company_address?: string | null;
  company_phone?: string | null;
  employee_name?: string | null;
  services: { name: string; duration_minutes: number; price: number | null }[];
  total_duration: number;
}

@Component({
  selector: 'app-reschedule-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, DatePickerModule],
  templateUrl: './reschedule-appointment.component.html',
  styleUrl: './reschedule-appointment.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RescheduleAppointmentComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private appointmentService = inject(AppointmentService);
  private emailNotificationService = inject(EmailNotificationService);
  private confirmationDialog = inject(PrimeNGConfirmationDialog);

  loading = signal(true);
  notFound = signal(false);
  notReschedulable = signal(false);
  appointment = signal<AppointmentByToken | null>(null);

  selectedDate = signal<Date | null>(null);
  dateTouched = signal(false);
  availableSlots = signal<string[]>([]);
  loadingSlots = signal(false);
  selectedTime = signal('');
  submitting = signal(false);
  error = signal('');

  success = signal(false);
  rescheduledDate = signal('');
  rescheduledTime = signal('');

  minDate: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  canConfirm = computed(() =>
    !!this.selectedDate() && !!this.selectedTime() && !this.submitting() && !this.loadingSlots()
  );

  services = computed(() => this.appointment()?.services ?? []);
  totalDuration = computed(() => this.appointment()?.total_duration ?? 0);

  async ngOnInit(): Promise<void> {
    const token = this.route.snapshot.paramMap.get('token');

    if (!token) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }

    try {
      const appointment = await this.appointmentService.getByToken(token);
      if (!appointment) {
        this.notFound.set(true);
        return;
      }
      this.appointment.set(appointment as AppointmentByToken);
      this.notReschedulable.set(appointment.status !== 'pending');
    } catch {
      this.notFound.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  async onDateSelect(date: Date): Promise<void> {
    this.selectedDate.set(date);
    this.dateTouched.set(true);
    this.selectedTime.set('');
    this.error.set('');
    this.availableSlots.set([]);

    const appointment = this.appointment();
    if (!date || !appointment) return;

    await this.loadSlots(this.formatDateToStr(date));
  }

  async loadSlots(dateStr: string): Promise<void> {
    const appointment = this.appointment();
    if (!appointment) return;

    this.loadingSlots.set(true);
    try {
      const slots = await this.appointmentService.getAvailableSlots(
        appointment.company_id,
        appointment.employee_id,
        dateStr,
        appointment.total_duration || 30,
        appointment.id
      );
      this.availableSlots.set(slots);
    } catch {
      this.availableSlots.set([]);
    } finally {
      this.loadingSlots.set(false);
    }
  }

  selectTime(slot: string): void {
    this.selectedTime.set(slot);
  }

  async confirmReschedule(): Promise<void> {
    const appointment = this.appointment();
    const date = this.selectedDate();
    const time = this.selectedTime();

    if (!appointment || !date || !time) return;

    const confirmed = await this.confirmationDialog.confirm({
      message: '¿Confirmar reprogramación?',
      header: 'Reprogramar cita',
      acceptLabel: 'Sí, reprogramar',
      rejectLabel: 'Cancelar'
    });
    if (!confirmed) return;

    this.submitting.set(true);
    this.error.set('');
    try {
      const dateStr = this.formatDateToStr(date);
      await this.appointmentService.rescheduleByToken(
        this.route.snapshot.paramMap.get('token')!,
        dateStr,
        time
      );

      this.rescheduledDate.set(dateStr);
      this.rescheduledTime.set(time);
      this.success.set(true);
      this.emailNotificationService.notify(appointment.id, 'rescheduled');
    } catch (err: any) {
      this.error.set(err?.message || 'El horario seleccionado ya no está disponible');
      this.selectedTime.set('');
      if (this.selectedDate()) {
        await this.loadSlots(this.formatDateToStr(this.selectedDate()!));
      }
    } finally {
      this.submitting.set(false);
    }
  }

  formatDate(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) return dateStr;
    return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  formatTime(time: string): string {
    return time ? time.substring(0, 5) : '';
  }

  private formatDateToStr(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
