import { Component, inject, signal, computed, ChangeDetectionStrategy, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { WeeklyReportService } from '../../../../../core/services/weekly-report.service';
import { CsvExportService } from '../../../../../shared/services/csv-export.service';
import {
  WeeklyDetailRow,
  formatDate,
  getStatusLabel,
  getStatusSeverity
} from '../../../../../core/models/weekly-report.model';
import { formatServicesList } from '../../../../../core/models/appointment.model';

@Component({
  selector: 'app-employee-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    TableModule,
    ButtonModule,
    TagModule,
    SkeletonModule
  ],
  templateUrl: './employee-detail-dialog.component.html',
  styleUrl: './employee-detail-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeDetailDialogComponent implements OnChanges {
  private weeklyReportService = inject(WeeklyReportService);
  private csvExportService = inject(CsvExportService);

  @Input({ required: true }) visible = false;
  @Input({ required: true }) employeeId = '';
  @Input({ required: true }) employeeName = '';
  @Input({ required: true }) companyId = '';
  @Input({ required: true }) startDate!: Date;
  @Input({ required: true }) endDate!: Date;
  @Output() onClose = new EventEmitter<void>();

  loading = signal(true);
  exporting = signal(false);
  detailData = signal<WeeklyDetailRow[]>([]);

  completedCount = computed(() => this.detailData().filter(r => r.status === 'completed').length);
  pendingCount = computed(() => this.detailData().filter(r => r.status === 'pending').length);
  cancelledCount = computed(() => this.detailData().filter(r => r.status === 'cancelled').length);
  noShowCount = computed(() => this.detailData().filter(r => r.status === 'no_show').length);
  totalAmount = computed(() => this.detailData().reduce((sum, r) => sum + r.amount_collected, 0));
  totalCommission = computed(() => this.detailData().reduce((sum, r) => sum + r.commission, 0));

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible'] && this.visible && this.employeeId && this.companyId) {
      this.loadDetail();
    }
  }

  async loadDetail() {
    this.loading.set(true);
    try {
      const data = await this.weeklyReportService.getEmployeeDetail(
        this.companyId,
        this.employeeId,
        this.startDate,
        this.endDate
      );
      this.detailData.set(data);
    } catch (err) {
      this.detailData.set([]);
    }
    this.loading.set(false);
  }

  closeDialog() {
    this.onClose.emit();
  }

  exportDetailCsv() {
    const data = this.detailData();
    if (data.length === 0) return;

    this.exporting.set(true);

    const headers = ['Fecha', 'Hora', 'Cliente', 'Servicios', 'Monto', 'Comisión', 'Estado'];
    const rows = data.map(row => [
      row.appointment_date,
      row.appointment_time,
      row.client_name,
      formatServicesList(row.services),
      `$${row.amount_collected.toFixed(2)}`,
      `$${row.commission.toFixed(2)}`,
      getStatusLabel(row.status)
    ]);

    const filename = `detalle-${this.employeeName.replace(/\s+/g, '-').toLowerCase()}-${formatDate(this.startDate)}-a-${formatDate(this.endDate)}.csv`;
    this.csvExportService.exportCsv(filename, headers, rows);

    this.exporting.set(false);
  }

  formatDateDisplay(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatTimeDisplay(timeStr: string): string {
    const [hours, minutes] = timeStr.split(':');
    return `${hours}:${minutes}`;
  }

  getStatusLabel = getStatusLabel;
  getStatusSeverity = getStatusSeverity;
  formatServicesList = formatServicesList;
}