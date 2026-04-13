import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../../../core/services/auth.service';
import { WeeklyReportService } from '../../../../../core/services/weekly-report.service';
import { CsvExportService } from '../../../../../shared/services/csv-export.service';
import { User } from '../../../../../core/models/user.model';
import {
  WeeklySummaryRow,
  WeeklyDetailRow,
  DateRange,
  getStartOfWeek,
  getEndOfWeek,
  formatDate,
  getStatusLabel,
  getStatusSeverity
} from '../../../../../core/models/weekly-report.model';
import { formatServicesList } from '../../../../../core/models/appointment.model';
import { EmployeeDetailDialogComponent } from './employee-detail-dialog.component';

@Component({
  selector: 'app-weekly-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    DatePickerModule,
    ButtonModule,
    SelectModule,
    TagModule,
    DialogModule,
    SkeletonModule,
    ToastModule,
    EmployeeDetailDialogComponent
  ],
  templateUrl: './weekly-report.component.html',
  styleUrl: './weekly-report.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService]
})
export class WeeklyReportComponent implements OnInit {
  private authService = inject(AuthService);
  private weeklyReportService = inject(WeeklyReportService);
  private csvExportService = inject(CsvExportService);
  private messageService = inject(MessageService);

  user = signal<User | null>(null);
  loading = signal(true);
  exporting = signal(false);

  summaryData = signal<WeeklySummaryRow[]>([]);
  employees = signal<User[]>([]);

  dateRange = signal<DateRange>({ start: getStartOfWeek(new Date()), end: getEndOfWeek(new Date()) });
  startDateValue: Date | null = getStartOfWeek(new Date());
  endDateValue: Date | null = getEndOfWeek(new Date());

  selectedEmployeeId = signal<string | null>(null);
  selectedEmployeeValue: string | null = null;

  dialogVisible = signal(false);
  selectedEmployee = signal<{ id: string; name: string } | null>(null);

  totalAppointments = computed(() =>
    this.summaryData().reduce((sum, row) => sum + row.total_appointments, 0)
  );

  totalAmount = computed(() =>
    this.summaryData().reduce((sum, row) => sum + row.total_amount, 0)
  );

  totalCommission = computed(() =>
    this.summaryData().reduce((sum, row) => sum + row.total_commission, 0)
  );

  employeeOptions = computed(() => {
    const options = [{ label: 'Todos los empleados', value: null as string | null }];
    return [
      ...options,
      ...this.employees().map(emp => ({ label: emp.full_name, value: emp.id }))
    ];
  });

  dateRangeLabel = computed(() => {
    const range = this.dateRange();
    const start = range.start.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    const end = range.end.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    return `${start} - ${end}`;
  });

  async ngOnInit() {
    const now = new Date();
    const range = { start: getStartOfWeek(now), end: getEndOfWeek(now) };
    this.dateRange.set(range);
    this.startDateValue = range.start;
    this.endDateValue = range.end;

    const user = await this.authService.getCurrentUser();
    this.user.set(user);
    if (user?.company_id) {
      await Promise.all([
        this.loadEmployees(user.company_id),
        this.loadSummary()
      ]);
    }
    this.loading.set(false);
  }

  async loadEmployees(companyId: string) {
    try {
      const employees = await this.weeklyReportService.getEmployees(companyId);
      this.employees.set(employees);
    } catch (err) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los empleados' });
    }
  }

  async loadSummary() {
    const user = this.user();
    if (!user?.company_id) return;

    this.loading.set(true);
    try {
      const range = this.dateRange();
      const data = await this.weeklyReportService.getWeeklySummary(
        user.company_id,
        range.start,
        range.end,
        this.selectedEmployeeId() || undefined
      );
      this.summaryData.set(data);
    } catch (err) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos del reporte' });
    }
    this.loading.set(false);
  }

  onStartDateChange() {
    if (this.startDateValue) {
      const range = this.dateRange();
      this.dateRange.set({ start: this.startDateValue, end: range.end });
      this.loadSummary();
    }
  }

  onEndDateChange() {
    if (this.endDateValue) {
      const range = this.dateRange();
      this.dateRange.set({ start: range.start, end: this.endDateValue });
      this.loadSummary();
    }
  }

  onEmployeeChange(event: any) {
    this.selectedEmployeeId.set(event.value);
    this.loadSummary();
  }

  previousWeek() {
    const range = this.dateRange();
    const newStart = new Date(range.start);
    newStart.setDate(newStart.getDate() - 7);
    const newEnd = new Date(range.end);
    newEnd.setDate(newEnd.getDate() - 7);
    this.dateRange.set({ start: newStart, end: newEnd });
    this.startDateValue = newStart;
    this.endDateValue = newEnd;
    this.loadSummary();
  }

  nextWeek() {
    const range = this.dateRange();
    const newStart = new Date(range.start);
    newStart.setDate(newStart.getDate() + 7);
    const newEnd = new Date(range.end);
    newEnd.setDate(newEnd.getDate() + 7);
    this.dateRange.set({ start: newStart, end: newEnd });
    this.startDateValue = newStart;
    this.endDateValue = newEnd;
    this.loadSummary();
  }

  currentWeek() {
    const now = new Date();
    const range = { start: getStartOfWeek(now), end: getEndOfWeek(now) };
    this.dateRange.set(range);
    this.startDateValue = range.start;
    this.endDateValue = range.end;
    this.loadSummary();
  }

  openEmployeeDetail(employeeId: string, employeeName: string) {
    this.selectedEmployee.set({ id: employeeId, name: employeeName });
    this.dialogVisible.set(true);
  }

  closeDialog() {
    this.dialogVisible.set(false);
    this.selectedEmployee.set(null);
  }

  exportSummaryCsv() {
    const data = this.summaryData();
    if (data.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Sin datos', detail: 'No hay datos para exportar' });
      return;
    }

    this.exporting.set(true);

    const headers = ['Empleado', 'Total Citas', 'Total Monto', 'Total Comisión'];
    const range = this.dateRange();
    const rows = data.map(row => [
      row.employee_name,
      row.total_appointments.toString(),
      `$${row.total_amount.toFixed(2)}`,
      `$${row.total_commission.toFixed(2)}`
    ]);

    const filename = `reporte-semanal-${formatDate(range.start)}-a-${formatDate(range.end)}.csv`;
    this.csvExportService.exportCsv(filename, headers, rows);

    this.exporting.set(false);
    this.messageService.add({ severity: 'success', summary: 'Exportación exitosa', detail: `Se exportaron ${data.length} registros` });
  }

  formatServicesList = formatServicesList;
  getStatusLabel = getStatusLabel;
  getStatusSeverity = getStatusSeverity;
}