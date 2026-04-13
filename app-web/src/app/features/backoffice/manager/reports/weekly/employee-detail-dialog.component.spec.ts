import { signal, computed } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeeDetailDialogComponent } from './employee-detail-dialog.component';
import { WeeklyReportService } from '../../../../../core/services/weekly-report.service';
import { CsvExportService } from '../../../../../shared/services/csv-export.service';
import { WeeklyDetailRow } from '../../../../../core/models/weekly-report.model';

describe('EmployeeDetailDialogComponent', () => {
  const mockDetailData: WeeklyDetailRow[] = [
    {
      appointment_date: '2026-04-13',
      appointment_time: '10:00',
      client_name: 'Juan Pérez',
      services: [{ id: 's1', company_id: 'c1', name: 'Corte', duration_minutes: 30, price: 100, commission_percentage: 50, is_active: true, created_at: '2026-01-01' }],
      amount_collected: 150,
      status: 'completed',
      commission: 75
    },
    {
      appointment_date: '2026-04-14',
      appointment_time: '11:00',
      client_name: 'María Torres',
      services: [{ id: 's2', company_id: 'c1', name: 'Peinado', duration_minutes: 45, price: 80, commission_percentage: 40, is_active: true, created_at: '2026-01-01' }],
      amount_collected: 80,
      status: 'pending',
      commission: 32
    },
    {
      appointment_date: '2026-04-15',
      appointment_time: '09:00',
      client_name: 'Pedro Ruiz',
      services: [],
      amount_collected: 0,
      status: 'cancelled',
      commission: 0
    },
    {
      appointment_date: '2026-04-16',
      appointment_time: '15:00',
      client_name: 'Laura Díaz',
      services: [{ id: 's3', company_id: 'c1', name: 'Tinte', duration_minutes: 60, price: 120, commission_percentage: 30, is_active: true, created_at: '2026-01-01' }],
      amount_collected: 120,
      status: 'no_show',
      commission: 36
    }
  ];

  describe('lógica de signals y computed', () => {
    const createMock = () => {
      const detailData = signal<WeeklyDetailRow[]>([]);
      const loading = signal(true);

      const completedCount = computed(() => detailData().filter(r => r.status === 'completed').length);
      const pendingCount = computed(() => detailData().filter(r => r.status === 'pending').length);
      const cancelledCount = computed(() => detailData().filter(r => r.status === 'cancelled').length);
      const noShowCount = computed(() => detailData().filter(r => r.status === 'no_show').length);
      const totalAmount = computed(() => detailData().reduce((sum, r) => sum + r.amount_collected, 0));
      const totalCommission = computed(() => detailData().reduce((sum, r) => sum + r.commission, 0));

      return {
        detailData, loading,
        completedCount, pendingCount, cancelledCount, noShowCount,
        totalAmount, totalCommission
      };
    };

    it('debe contar citas completadas correctamente', () => {
      const comp = createMock();
      comp.detailData.set(mockDetailData);
      expect(comp.completedCount()).toBe(1);
    });

    it('debe contar citas pendientes correctamente', () => {
      const comp = createMock();
      comp.detailData.set(mockDetailData);
      expect(comp.pendingCount()).toBe(1);
    });

    it('debe contar citas canceladas correctamente', () => {
      const comp = createMock();
      comp.detailData.set(mockDetailData);
      expect(comp.cancelledCount()).toBe(1);
    });

    it('debe contar citas no_show correctamente', () => {
      const comp = createMock();
      comp.detailData.set(mockDetailData);
      expect(comp.noShowCount()).toBe(1);
    });

    it('debe calcular el monto total sumando todas las citas', () => {
      const comp = createMock();
      comp.detailData.set(mockDetailData);
      expect(comp.totalAmount()).toBe(350); // 150 + 80 + 0 + 120
    });

    it('debe calcular la comisión total sumando todas las citas', () => {
      const comp = createMock();
      comp.detailData.set(mockDetailData);
      expect(comp.totalCommission()).toBe(143); // 75 + 32 + 0 + 36
    });

    it('debe retornar ceros cuando no hay datos', () => {
      const comp = createMock();
      expect(comp.completedCount()).toBe(0);
      expect(comp.pendingCount()).toBe(0);
      expect(comp.cancelledCount()).toBe(0);
      expect(comp.noShowCount()).toBe(0);
      expect(comp.totalAmount()).toBe(0);
      expect(comp.totalCommission()).toBe(0);
    });

    it('debe recalcular cuando cambian los datos', () => {
      const comp = createMock();
      comp.detailData.set(mockDetailData);
      expect(comp.completedCount()).toBe(1);

      comp.detailData.set(mockDetailData.filter(r => r.status === 'completed'));
      expect(comp.completedCount()).toBe(1);
      expect(comp.pendingCount()).toBe(0);
    });
  });

  describe('comportamiento con servicios mock', () => {
    let component: EmployeeDetailDialogComponent;
    let fixture: ComponentFixture<EmployeeDetailDialogComponent>;
    let weeklyReportServiceMock: jest.Mocked<WeeklyReportService>;
    let csvExportServiceMock: jest.Mocked<CsvExportService>;

    beforeEach(async () => {
      weeklyReportServiceMock = {
        getEmployees: jest.fn(),
        getWeeklySummary: jest.fn(),
        getEmployeeDetail: jest.fn().mockResolvedValue(mockDetailData)
      } as any;

      csvExportServiceMock = {
        exportCsv: jest.fn()
      } as any;

      await TestBed.configureTestingModule({
        imports: [EmployeeDetailDialogComponent],
        providers: [
          { provide: WeeklyReportService, useValue: weeklyReportServiceMock },
          { provide: CsvExportService, useValue: csvExportServiceMock }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(EmployeeDetailDialogComponent);
      component = fixture.componentInstance;
      component.visible = true;
      component.employeeId = 'emp-1';
      component.employeeName = 'Ana García';
      component.companyId = 'company-1';
      component.startDate = new Date(2026, 3, 13);
      component.endDate = new Date(2026, 3, 19);
    });

    it('debe llamar a getEmployeeDetail cuando visible cambia a true', () => {
      component.ngOnChanges({ visible: { currentValue: true, previousValue: false, firstChange: false } } as any);
      expect(weeklyReportServiceMock.getEmployeeDetail).toHaveBeenCalledWith(
        'company-1', 'emp-1', expect.any(Date), expect.any(Date)
      );
    });

    it('debe emitir onClose al cerrar el diálogo', () => {
      const emitSpy = jest.spyOn(component.onClose, 'emit');
      component.closeDialog();
      expect(emitSpy).toHaveBeenCalled();
    });

    it('debe llamar a csvExportService al exportar detalle CSV', () => {
      component.detailData.set(mockDetailData);
      component.exportDetailCsv();

      expect(csvExportServiceMock.exportCsv).toHaveBeenCalledWith(
        expect.stringContaining('detalle-ana-garc'),
        expect.arrayContaining(['Fecha', 'Hora', 'Cliente', 'Servicios', 'Monto', 'Comisión', 'Estado']),
        expect.any(Array)
      );
    });

    it('no debe exportar CSV si no hay datos', () => {
      component.detailData.set([]);
      component.exportDetailCsv();
      expect(csvExportServiceMock.exportCsv).not.toHaveBeenCalled();
    });

    it('debe establecer loading en false después de cargar', async () => {
      component.ngOnChanges({ visible: { currentValue: true, previousValue: false, firstChange: false } } as any);

      await fixture.whenStable();
      expect(component.loading()).toBe(false);
    });

    it('debe establecer detailData vacío si hay error', async () => {
      weeklyReportServiceMock.getEmployeeDetail.mockRejectedValueOnce(new Error('DB error'));

      component.ngOnChanges({ visible: { currentValue: true, previousValue: false, firstChange: false } } as any);
      await fixture.whenStable();

      expect(component.detailData()).toEqual([]);
    });

    it('no debe cargar detalle si visible es false', () => {
      component.visible = false;
      component.ngOnChanges({ visible: { currentValue: false, previousValue: true, firstChange: false } } as any);
      expect(weeklyReportServiceMock.getEmployeeDetail).not.toHaveBeenCalled();
    });
  });
});