import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { DrawerModule } from 'primeng/drawer';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService } from 'primeng/api';
import { DailyCloseFacade, Employee, AppointmentWithRelations } from './daily-close.facade';
import { CONFIRMATION_DIALOG } from '../../../../core/tokens/confirmation-dialog.token';
import { IConfirmationDialog } from '../../../../core/interfaces/confirmation-dialog.interface';

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
    ToastModule,
    InputTextModule,
    DrawerModule,
    InputNumberModule,
    ConfirmDialogModule
  ],
  providers: [
    MessageService,
    DailyCloseFacade
  ],
  templateUrl: './daily-close.component.html',
  styleUrl: './daily-close.component.scss'
})
export class DailyCloseComponent implements OnInit {
  private facade = inject(DailyCloseFacade);
  private messageService = inject(MessageService);
  private confirmationDialog = inject<IConfirmationDialog>(CONFIRMATION_DIALOG);

  // UI State
  amountDrawerVisible = signal(false);
  selectedAppointment = signal<AppointmentWithRelations | null>(null);
  amountInput: number | null = null;
  searchQuery = signal('');

  maxDateValue = new Date();

  // Expose facade signals directly
  get appointments() { return this.facade.appointments; }
  get selectedDate() { return this.facade.selectedDate; }
  get selectedEmployee() { return this.facade.selectedEmployee; }
  get loading() { return this.facade.loading; }
  get generating() { return this.facade.generating; }
  get alreadyClosed() { return this.facade.alreadyClosed; }
  get employees() { return this.facade.employees; }
  get filteredAppointments() { return this.facade.filteredAppointments; }
  get employeeStats() { return this.facade.employeeStats; }
  get dayStats() { return this.facade.dayStats; }
  get completedAppointments() { return this.facade.completedAppointments; }
  get canNavigateNext() { return this.facade.canNavigateNext; }
  get isToday() { return this.facade.isToday; }
  get companyName() { return this.facade.companyName; }

  filteredEmployees = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const allEmployees = this.employees();
    if (!query) return allEmployees;
    return allEmployees.filter(emp =>
      emp.full_name.toLowerCase().includes(query)
    );
  });

  appointmentsByEmployee = computed(() => this.filteredAppointments());

  async ngOnInit() {
    await this.facade.initialize();
  }

  selectEmployee(employee: Employee | null) {
    this.facade.selectEmployee(employee);
  }

  onSearchChange(value: string) {
    this.searchQuery.set(value);
  }

  navigateToPreviousDay() {
    this.facade.navigateToPreviousDay();
  }

  navigateToNextDay() {
    this.facade.navigateToNextDay();
  }

  onDateChange() {
    this.facade.loadAppointments();
  }

  openCompleteDrawer(appointment: AppointmentWithRelations) {
    this.selectedAppointment.set(appointment);
    this.amountInput = null;
    this.amountDrawerVisible.set(true);
  }

  closeDrawer() {
    this.amountDrawerVisible.set(false);
    this.selectedAppointment.set(null);
    this.amountInput = null;
  }

  async confirmCompletion() {
    const apt = this.selectedAppointment();
    if (!apt) return;

    if (this.amountInput === null || this.amountInput === undefined || this.amountInput <= 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El monto debe ser mayor a 0'
      });
      return;
    }

    try {
      await this.facade.confirmAppointmentCompletion(apt.id, this.amountInput);
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Cita completada exitosamente'
      });
      this.closeDrawer();
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'No se pudo completar la cita'
      });
    }
  }

  async markAsNoShow(appointment: AppointmentWithRelations) {
    const confirmed = await this.confirmationDialog.confirm({
      message: '¿Marcar esta cita como "No asistió"?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, marcar',
      rejectLabel: 'Cancelar'
    });

    if (!confirmed) return;

    try {
      await this.facade.markAppointmentAsNoShow(appointment.id);
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Cita marcada como no asistió'
      });
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'No se pudo actualizar la cita'
      });
    }
  }

  async cancelAppointment(appointment: AppointmentWithRelations) {
    const confirmed = await this.confirmationDialog.confirm({
      message: '¿Cancelar esta cita?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cancelar',
      rejectLabel: 'No cancelar'
    });

    if (!confirmed) return;

    try {
      await this.facade.cancelAppointment(appointment.id);
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Cita cancelada'
      });
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'No se pudo cancelar la cita'
      });
    }
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

    try {
      await this.facade.generateDailyClose();
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
    }
  }

  getEmployeeStats(employeeId: string) {
    return this.facade.getEmployeeStats(employeeId);
  }

  getStatusLabel(status: string): string {
    return this.facade.getStatusLabel(status);
  }

  getStatusClass(status: string): string {
    return this.facade.getStatusClass(status);
  }

  formatDate(date: Date): string {
    return this.facade.formatDate(date);
  }

  formatDateShort(date: Date): string {
    return this.facade.formatDateShort(date);
  }

  getEmployeeNameById(empId: string): string {
    return this.facade.getEmployeeNameById(empId);
  }

  getInitials(name: string): string {
    return this.facade.getInitials(name);
  }
}