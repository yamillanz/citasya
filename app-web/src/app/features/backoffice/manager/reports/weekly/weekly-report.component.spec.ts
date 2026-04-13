import { signal, computed } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WeeklyReportComponent } from './weekly-report.component';
import { AuthService } from '../../../../../core/services/auth.service';
import { WeeklyReportService } from '../../../../../core/services/weekly-report.service';
import { CsvExportService } from '../../../../../shared/services/csv-export.service';
import { MessageService } from 'primeng/api';
import { WeeklySummaryRow, DateRange } from '../../../../../core/models/weekly-report.model';
import { User } from '../../../../../core/models/user.model';

describe('WeeklyReportComponent', () => {
  const mockUser: User = {
    id: 'user-1',
    email: 'manager@test.com',
    full_name: 'Manager Test',
    role: 'manager',
    company_id: 'company-1',
    is_active: true,
    created_at: '2026-01-01',
    updated_at: '2026-01-01'
  };

  const mockSummary: WeeklySummaryRow[] = [
    { employee_id: 'emp-1', employee_name: 'Ana García', total_appointments: 5, total_amount: 500, total_commission: 150 },
    { employee_id: 'emp-2', employee_name: 'Carlos López', total_appointments: 3, total_amount: 300, total_commission: 90 }
  ];

  const mockEmployees = [
    { id: 'emp-1', full_name: 'Ana García', role: 'employee', company_id: 'company-1', is_active: true, email: 'ana@test.com', created_at: '2026-01-01', updated_at: '2026-01-01' },
    { id: 'emp-2', full_name: 'Carlos López', role: 'manager', company_id: 'company-1', is_active: true, email: 'carlos@test.com', created_at: '2026-01-01', updated_at: '2026-01-01' }
  ];

  describe('lógica de signals y computed', () => {
    const createMock = () => {
      const summaryData = signal<WeeklySummaryRow[]>([]);
      const employees = signal<any[]>([]);
      const selectedEmployeeId = signal<string | null>(null);
      const dateRange = signal<DateRange>({
        start: new Date(2026, 3, 13),
        end: new Date(2026, 3, 19)
      });

      const totalAppointments = computed(() =>
        summaryData().reduce((sum, row) => sum + row.total_appointments, 0)
      );
      const totalAmount = computed(() =>
        summaryData().reduce((sum, row) => sum + row.total_amount, 0)
      );
      const totalCommission = computed(() =>
        summaryData().reduce((sum, row) => sum + row.total_commission, 0)
      );

      const employeeOptions = computed(() => {
        const options = [{ label: 'Todos los empleados', value: null as string | null }];
        return [
          ...options,
          ...employees().map(emp => ({ label: emp.full_name, value: emp.id }))
        ];
      });

      return {
        summaryData, employees, selectedEmployeeId, dateRange,
        totalAppointments, totalAmount, totalCommission, employeeOptions
      };
    };

    it('debe calcular el total de citas desde los datos del resumen', () => {
      const comp = createMock();
      comp.summaryData.set(mockSummary);
      expect(comp.totalAppointments()).toBe(8);
    });

    it('debe calcular el monto total desde los datos del resumen', () => {
      const comp = createMock();
      comp.summaryData.set(mockSummary);
      expect(comp.totalAmount()).toBe(800);
    });

    it('debe calcular la comisión total desde los datos del resumen', () => {
      const comp = createMock();
      comp.summaryData.set(mockSummary);
      expect(comp.totalCommission()).toBe(240);
    });

    it('debe retornar 0 para totales cuando no hay datos', () => {
      const comp = createMock();
      expect(comp.totalAppointments()).toBe(0);
      expect(comp.totalAmount()).toBe(0);
      expect(comp.totalCommission()).toBe(0);
    });

    it('debe construir opciones de empleado con "Todos" como primera opción', () => {
      const comp = createMock();
      comp.employees.set(mockEmployees);
      expect(comp.employeeOptions()).toHaveLength(3);
      expect(comp.employeeOptions()[0]).toEqual({ label: 'Todos los empleados', value: null });
      expect(comp.employeeOptions()[1]).toEqual({ label: 'Ana García', value: 'emp-1' });
    });

    it('debe mostrar solo "Todos" cuando no hay empleados cargados', () => {
      const comp = createMock();
      expect(comp.employeeOptions()).toHaveLength(1);
      expect(comp.employeeOptions()[0].label).toBe('Todos los empleados');
    });

    it('debe recalcular totales cuando cambia el resumen', () => {
      const comp = createMock();
      comp.summaryData.set(mockSummary);
      expect(comp.totalAppointments()).toBe(8);

      comp.summaryData.set([
        { employee_id: 'emp-1', employee_name: 'Ana García', total_appointments: 2, total_amount: 200, total_commission: 60 }
      ]);
      expect(comp.totalAppointments()).toBe(2);
      expect(comp.totalAmount()).toBe(200);
    });
  });

  describe('comportamiento con servicios mock', () => {
    let component: WeeklyReportComponent;
    let fixture: ComponentFixture<WeeklyReportComponent>;
    let authServiceMock: jest.Mocked<AuthService>;
    let weeklyReportServiceMock: jest.Mocked<WeeklyReportService>;
    let csvExportServiceMock: jest.Mocked<CsvExportService>;

    beforeEach(async () => {
      authServiceMock = {
        getCurrentUser: jest.fn().mockResolvedValue(mockUser)
      } as any;

      weeklyReportServiceMock = {
        getEmployees: jest.fn().mockResolvedValue(mockEmployees),
        getWeeklySummary: jest.fn().mockResolvedValue(mockSummary),
        getEmployeeDetail: jest.fn().mockResolvedValue([])
      } as any;

      csvExportServiceMock = {
        exportCsv: jest.fn()
      } as any;

      await TestBed.configureTestingModule({
        imports: [WeeklyReportComponent],
        providers: [
          { provide: AuthService, useValue: authServiceMock },
          { provide: WeeklyReportService, useValue: weeklyReportServiceMock },
          { provide: CsvExportService, useValue: csvExportServiceMock },
          MessageService
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(WeeklyReportComponent);
      component = fixture.componentInstance;
    });

    it('debe llamar a getCurrentUser al inicializar', async () => {
      await component.ngOnInit();
      expect(authServiceMock.getCurrentUser).toHaveBeenCalled();
    });

    it('debe cargar empleados y datos del resumen al inicializar', async () => {
      await component.ngOnInit();

      expect(weeklyReportServiceMock.getEmployees).toHaveBeenCalledWith('company-1');
      expect(weeklyReportServiceMock.getWeeklySummary).toHaveBeenCalled();
    });

    it('debe establecer loading en false después de cargar', async () => {
      expect(component.loading()).toBe(true);
      await component.ngOnInit();
      expect(component.loading()).toBe(false);
    });

    it('debe abrir el diálogo de detalle de empleado', () => {
      component.openEmployeeDetail('emp-1', 'Ana García');
      expect(component.dialogVisible()).toBe(true);
      expect(component.selectedEmployee()).toEqual({ id: 'emp-1', name: 'Ana García' });
    });

    it('debe cerrar el diálogo y limpiar empleado seleccionado', () => {
      component.openEmployeeDetail('emp-1', 'Ana García');
      component.closeDialog();
      expect(component.dialogVisible()).toBe(false);
      expect(component.selectedEmployee()).toBeNull();
    });

    it('debe llamar a csvExportService al exportar resumen CSV', () => {
      component.summaryData.set(mockSummary);
      component.exportSummaryCsv();

      expect(csvExportServiceMock.exportCsv).toHaveBeenCalledWith(
        expect.stringContaining('reporte-semanal-'),
        expect.arrayContaining(['Empleado', 'Total Citas', 'Total Monto', 'Total Comisión']),
        expect.any(Array)
      );
    });

    it('no debe exportar CSV si no hay datos', () => {
      component.summaryData.set([]);
      component.exportSummaryCsv();

      expect(csvExportServiceMock.exportCsv).not.toHaveBeenCalled();
    });

    it('debe navegar a la semana anterior', async () => {
      await component.ngOnInit();
      const initialRange = { ...component.dateRange() };
      component.previousWeek();

      const newStart = component.dateRange().start;
      expect(newStart.getTime()).toBeLessThan(initialRange.start.getTime());
    });

    it('debe navegar a la semana siguiente', async () => {
      await component.ngOnInit();
      const initialRange = { ...component.dateRange() };
      component.nextWeek();

      const newStart = component.dateRange().start;
      expect(newStart.getTime()).toBeGreaterThan(initialRange.start.getTime());
    });

    it('debe resetear a la semana actual con currentWeek', async () => {
      await component.ngOnInit();
      component.previousWeek();
      component.currentWeek();

      const now = new Date();
      const startOfWeek = component.dateRange().start;
      expect(startOfWeek.getDay()).toBe(1);
    });

    it('debe filtrar por empleado cuando se selecciona uno', async () => {
      await component.ngOnInit();
      weeklyReportServiceMock.getWeeklySummary.mockClear();

      component.onEmployeeChange({ value: 'emp-1' });

      expect(component.selectedEmployeeId()).toBe('emp-1');
      expect(weeklyReportServiceMock.getWeeklySummary).toHaveBeenCalledWith(
        'company-1',
        expect.any(Date),
        expect.any(Date),
        'emp-1'
      );
    });
  });
});