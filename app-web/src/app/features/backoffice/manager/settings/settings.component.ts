import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../../core/services/auth.service';
import { CompanyService } from '../../../../core/services/company.service';
import { ScheduleService, Schedule } from '../../../../core/services/schedule.service';

interface DayScheduleForm {
  day_of_week: number;
  is_active: boolean;
  start_time: string;
  end_time: string;
  id: string | null;
}

const DAY_NAMES: Record<number, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  0: 'Domingo'
};

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private companyService = inject(CompanyService);
  private scheduleService = inject(ScheduleService);
  private messageService = inject(MessageService);

  loading = signal(true);
  saving = signal(false);
  companyId = signal<string | null>(null);
  daySchedules = signal<DayScheduleForm[]>([]);
  dayNames = DAY_NAMES;
  dayOrder = DAY_ORDER;

  companyForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    address: [''],
    phone: ['']
  });

  async ngOnInit() {
    const user = await this.authService.getCurrentUser();
    if (!user?.company_id) {
      this.loading.set(false);
      return;
    }

    this.companyId.set(user.company_id);

    try {
      const [company, schedules] = await Promise.all([
        this.companyService.getById(user.company_id),
        this.scheduleService.getByCompany(user.company_id, true)
      ]);

      if (company) {
        this.companyForm.patchValue({
          name: company.name,
          address: company.address || '',
          phone: company.phone || ''
        });
      }

      this.initScheduleForms(schedules);
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar la configuración'
      });
    } finally {
      this.loading.set(false);
    }
  }

  private initScheduleForms(schedules: Schedule[]) {
    const scheduleMap = new Map<number, Schedule>();
    for (const s of schedules) {
      scheduleMap.set(s.day_of_week, s);
    }

    const daySchedules: DayScheduleForm[] = [];

    for (const dayOfWeek of DAY_ORDER) {
      const existing = scheduleMap.get(dayOfWeek);
      daySchedules.push({
        day_of_week: dayOfWeek,
        is_active: existing?.is_active ?? false,
        start_time: existing?.start_time?.substring(0, 5) || '09:00',
        end_time: existing?.end_time?.substring(0, 5) || '18:00',
        id: existing?.id || null
      });
    }

    this.daySchedules.set(daySchedules);
  }

  onToggleChange(dayOfWeek: number, checked: boolean) {
    this.daySchedules.update(days =>
      days.map(d =>
        d.day_of_week === dayOfWeek ? { ...d, is_active: checked } : d
      )
    );
  }

  onStartTimeChange(dayOfWeek: number, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.daySchedules.update(days =>
      days.map(d =>
        d.day_of_week === dayOfWeek ? { ...d, start_time: value } : d
      )
    );
  }

  onEndTimeChange(dayOfWeek: number, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.daySchedules.update(days =>
      days.map(d =>
        d.day_of_week === dayOfWeek ? { ...d, end_time: value } : d
      )
    );
  }

  hasTimeError(dayOfWeek: number): boolean {
    const day = this.daySchedules().find(d => d.day_of_week === dayOfWeek);
    if (!day?.is_active || !day.start_time || !day.end_time) return false;
    return day.start_time >= day.end_time;
  }

  async onSubmit() {
    if (this.companyForm.invalid) {
      Object.values(this.companyForm.controls).forEach(c => c.markAsTouched());
      return;
    }

    for (const dayOfWeek of DAY_ORDER) {
      if (this.hasTimeError(dayOfWeek)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Horario inválido para ${DAY_NAMES[dayOfWeek]}: la hora de inicio debe ser anterior a la de fin`
        });
        return;
      }
    }

    this.saving.set(true);

    try {
      const companyId = this.companyId()!;
      const formValue = this.companyForm.value;

      await this.companyService.update(companyId, {
        name: formValue.name!,
        address: formValue.address || undefined,
        phone: formValue.phone || undefined
      });

      const currentDays = this.daySchedules();
      for (const day of currentDays) {
        const scheduleData: Partial<Schedule> = {
          company_id: companyId,
          day_of_week: day.day_of_week,
          start_time: day.start_time + ':00',
          end_time: day.end_time + ':00',
          is_active: day.is_active
        };

        if (day.id) {
          await this.scheduleService.update(day.id, scheduleData);
        } else if (day.is_active) {
          await this.scheduleService.create(scheduleData);
        }
      }

      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Configuración guardada correctamente'
      });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo guardar la configuración'
      });
    } finally {
      this.saving.set(false);
    }
  }

  get nameError(): string {
    const control = this.companyForm.get('name');
    if (control?.hasError('required') && control?.touched) {
      return 'El nombre de la empresa es obligatorio';
    }
    if (control?.hasError('minlength') && control?.touched) {
      return 'El nombre debe tener al menos 2 caracteres';
    }
    return '';
  }
}
