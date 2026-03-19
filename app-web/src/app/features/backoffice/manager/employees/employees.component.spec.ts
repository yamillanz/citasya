import { ComponentFixture, TestBed, waitForAsync, NO_ERRORS_SCHEMA } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { EmployeesComponent } from './employees.component';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';

describe('EmployeesComponent - Behavior Driven Tests', () => {
  let component: EmployeesComponent;
  let fixture: ComponentFixture<EmployeesComponent>;
  let authServiceMock: jest.Mocked<AuthService>;
  let userServiceMock: jest.Mocked<UserService>;

  const mockUser = {
    id: 'user-1',
    email: 'manager@test.com',
    full_name: 'Manager Test',
    role: 'manager' as const,
    company_id: 'company-1',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const mockEmployees = [
    {
      id: 'emp-1',
      email: 'juan@test.com',
      full_name: 'Juan Pérez',
      phone: '555-123-4567',
      photo_url: 'https://example.com/juan.jpg',
      role: 'employee' as const,
      company_id: 'company-1',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'emp-2',
      email: 'maria@test.com',
      full_name: 'María García',
      phone: '555-987-6543',
      role: 'employee' as const,
      company_id: 'company-1',
      is_active: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  beforeEach(waitForAsync(async () => {
    authServiceMock = {
      getCurrentUser: jest.fn().mockResolvedValue(mockUser)
    } as any;

    userServiceMock = {
      getByCompany: jest.fn().mockResolvedValue(mockEmployees),
      update: jest.fn().mockResolvedValue({ ...mockEmployees[0], is_active: false })
    } as any;

    await TestBed.configureTestingModule({
      imports: [EmployeesComponent, RouterTestingModule, TooltipModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: UserService, useValue: userServiceMock },
        MessageService,
        provideNoopAnimations()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeesComponent);
    component = fixture.componentInstance;
  }));

  describe('when manager views employees list', () => {
    beforeEach(async () => {
      await component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should display page title', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Gestión de Empleados');
    });

    it('should show add employee button', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Nuevo Empleado');
    });

    it('should load employees into component state', () => {
      expect(component.employees().length).toBe(2);
      expect(component.employees()[0].full_name).toBe('Juan Pérez');
    });

    it('should display all employee names in template', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.textContent).toContain('Juan Pérez');
      expect(compiled.textContent).toContain('María García');
    });

    it('should display employee emails', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.textContent).toContain('juan@test.com');
      expect(compiled.textContent).toContain('maria@test.com');
    });

    it('should display employee phone numbers when available', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.textContent).toContain('555-123-4567');
      expect(compiled.textContent).toContain('555-987-6543');
    });

    it('should show status indicator for each employee', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.textContent).toContain('Activo');
      expect(compiled.textContent).toContain('Inactivo');
    });
  });

  describe('when there are no employees', () => {
    beforeEach(() => {
      userServiceMock.getByCompany = jest.fn().mockResolvedValue([]);
    });

    it('should show empty state with call to action', async () => {
      await component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.textContent).toContain('No hay empleados registrados');
      expect(compiled.textContent).toContain('Agregar Empleado');
    });
  });

  describe('when manager toggles employee status', () => {
    beforeEach(async () => {
      await component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should call userService to deactivate active employee', async () => {
      const activeEmployee = component.employees().find(e => e.is_active);
      expect(activeEmployee).toBeTruthy();

      await component.toggleEmployeeStatus(activeEmployee!);

      expect(userServiceMock.update).toHaveBeenCalledWith(
        activeEmployee!.id,
        { is_active: false }
      );
    });

    it('should call userService to activate inactive employee', async () => {
      const inactiveEmployee = component.employees().find(e => !e.is_active);
      expect(inactiveEmployee).toBeTruthy();

      userServiceMock.update = jest.fn().mockResolvedValue({
        ...inactiveEmployee,
        is_active: true
      });

      await component.toggleEmployeeStatus(inactiveEmployee!);

      expect(userServiceMock.update).toHaveBeenCalledWith(
        inactiveEmployee!.id,
        { is_active: true }
      );
    });

    it('should keep employee state unchanged when toggle fails', async () => {
      userServiceMock.update = jest.fn().mockRejectedValue(new Error('Update failed'));

      const employee = component.employees()[0];
      const initialState = employee.is_active;
      
      await component.toggleEmployeeStatus(employee);

      expect(userServiceMock.update).toHaveBeenCalled();
      expect(employee.is_active).toBe(initialState);
    });
  });

  describe('employee cards visual feedback', () => {
    beforeEach(async () => {
      await component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should have both active and inactive employees in list', () => {
      const activeCount = component.employees().filter(e => e.is_active).length;
      const inactiveCount = component.employees().filter(e => !e.is_active).length;
      
      expect(activeCount).toBeGreaterThan(0);
      expect(inactiveCount).toBeGreaterThan(0);
    });
  });
});
