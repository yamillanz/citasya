import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../../core/services/auth.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { DailyCloseService } from '../../../../core/services/daily-close.service';
import { CompanyService } from '../../../../core/services/company.service';
import { Appointment } from '../../../../core/models/appointment.model';

@Component({
  selector: 'app-daily-close',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    DatePickerModule,
    TableModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './daily-close.component.html',
  styleUrl: './daily-close.component.scss'
})
export class DailyCloseComponent implements OnInit {
  private authService = inject(AuthService);
  private appointmentService = inject(AppointmentService);
  private dailyCloseService = inject(DailyCloseService);
  private companyService = inject(CompanyService);
  private messageService = inject(MessageService);

  appointments = signal<Appointment[]>([]);
  selectedDate = signal<Date>(new Date());
  maxDateValue = new Date();
  loading = signal(true);
  generating = signal(false);
  alreadyClosed = signal(false);
  companyId = signal<string | null>(null);
  companyName = signal<string>('');

  completedAppointments = computed(() => 
    this.appointments().filter(apt => apt.status === 'completed')
  );

  totalAmount = computed(() => 
    this.completedAppointments().reduce((sum, apt) => sum + (apt.amount_collected || 0), 0)
  );

  appointmentsByEmployee = computed(() => {
    const grouped: { [key: string]: Appointment[] } = {};
    this.completedAppointments().forEach(apt => {
      const empId = apt.employee_id;
      if (!grouped[empId]) grouped[empId] = [];
      grouped[empId].push(apt);
    });
    return grouped;
  });

  async ngOnInit() {
    const user = await this.authService.getCurrentUser();
    if (user?.company_id) {
      this.companyId.set(user.company_id);
      await this.loadCompanyName();
      await this.loadAppointments();
    }
    this.loading.set(false);
  }

  async loadCompanyName() {
    if (!this.companyId()) return;
    
    try {
      const company = await this.companyService.getById(this.companyId()!);
      if (company) {
        this.companyName.set(company.name);
      }
    } catch (error) {
      console.error('Error loading company:', error);
    }
  }

  async loadAppointments() {
    if (!this.companyId()) return;
    
    this.loading.set(true);
    try {
      const dateStr = this.selectedDate().toISOString().split('T')[0];
      const appointments = await this.appointmentService.getByDate(
        this.companyId()!,
        dateStr
      );
      this.appointments.set(appointments);
      
      // Check if already closed
      const isClosed = await this.dailyCloseService.checkIfClosed(
        this.companyId()!,
        dateStr
      );
      this.alreadyClosed.set(isClosed);
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar las citas'
      });
    } finally {
      this.loading.set(false);
    }
  }

  onDateChange() {
    this.loadAppointments();
  }

  async generateClose() {
    if (this.completedAppointments().length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No hay citas completadas para generar el cierre'
      });
      return;
    }

    this.generating.set(true);

    try {
      const dateStr = this.selectedDate().toISOString().split('T')[0];
      await this.dailyCloseService.generateDailyClose(
        this.companyId()!,
        dateStr,
        this.completedAppointments(),
        this.companyName()
      );
      
      this.alreadyClosed.set(true);
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Cierre generado exitosamente. El PDF se ha descargado.'
      });
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'No se pudo generar el cierre'
      });
    } finally {
      this.generating.set(false);
    }
  }

  getEmployeeTotal(appointments: Appointment[]): number {
    return appointments.reduce((sum, apt) => sum + (apt.amount_collected || 0), 0);
  }

  getEmployeeInitials(empId: string): string {
    const appointments = this.appointmentsByEmployee()[empId];
    if (appointments && appointments.length > 0) {
      const name = this.$any(appointments[0]).employee?.full_name || '';
      return name.charAt(0).toUpperCase();
    }
    return '?';
  }

  objectKeys(obj: { [key: string]: Appointment[] }): string[] {
    return Object.keys(obj);
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
}