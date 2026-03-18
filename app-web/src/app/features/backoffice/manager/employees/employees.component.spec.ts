import { ComponentFixture, TestBed, NO_ERRORS_SCHEMA } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { EmployeesComponent } from './employees.component';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { MessageService } from 'primeng/api';

describe('EmployeesComponent - Behavior Driven Tests', () => {
  let component: EmployeesComponent;
  let fixture: ComponentFixture<EmployeesComponent>;
  let authServiceMock: jest.Mocked<AuthService>;
  let userServiceMock: jest.Mocked<UserService>;
  let messageServiceMock: jest.Mocked<MessageService>;

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

    messageServiceMock = {
      add: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [EmployeesComponent, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: MessageService, useValue: messageServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }));

  describe('when manager views employees list', () => {
    it('should display page title', () => {
      // Behavior: Manager knows which section they're in
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Gestión de Empleados');
    });

    it('should show add employee button', () => {
      // Behavior: Manager can easily add new employees
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Nuevo Empleado');
    });

    it('should display all employees with names', async () => {
      // Behavior: Manager sees complete team roster
      component.ngOnInit();
      // tick replaced by await
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.textContent).toContain('Juan Pérez');
      expect(compiled.textContent).toContain('María García');
    }));

    it('should display employee emails', async () => {
      // Behavior: Manager can see contact information
      component.ngOnInit();
      // tick replaced by await
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.textContent).toContain('juan@test.com');
      expect(compiled.textContent).toContain('maria@test.com');
    }));

    it('should display employee phone numbers when available', async () => {
      // Behavior: Manager sees phone contact info
      component.ngOnInit();
      // tick replaced by await
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.textContent).toContain('555-123-4567');
      expect(compiled.textContent).toContain('555-987-6543');
    }));

    it('should show status indicator for each employee', async () => {
      // Behavior: Manager can quickly identify active/inactive employees
      component.ngOnInit();
      // tick replaced by await
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.textContent).toContain('Activo');
      expect(compiled.textContent).toContain('Inactivo');
    }));
  });

  describe('when there are no employees', () => {
    beforeEach(() => {
      userServiceMock.getByCompany = jest.fn().mockResolvedValue([]);
    });

    it('should show empty state with call to action', async () => {
      // Behavior: Empty state guides manager to add first employee
      component.ngOnInit();
      // tick replaced by await
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.textContent).toContain('No hay empleados registrados');
      expect(compiled.textContent).toContain('Agregar primer empleado');
    }));
  });

  describe('when manager wants to edit an employee', () => {
    it('should show edit link for each employee', async () => {
      // Behavior: Each employee has an edit option
      component.ngOnInit();
      // tick replaced by await
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const editLinks = compiled.querySelectorAll('a[href*="/bo/employees/"]');
      
      expect(editLinks.length).toBeGreaterThanOrEqual(mockEmployees.length);
    }));
  });

  describe('when manager toggles employee status', () => {
    it('should deactivate active employee', fakeAsync(async () => {
      // Behavior: Manager can deactivate an active employee
      component.ngOnInit();
      // tick replaced by await

      const activeEmployee = component.employees().find(e => e.is_active);
      expect(activeEmployee).toBeTruthy();

      await component.toggleEmployeeStatus(activeEmployee!);
      // tick replaced by await

      expect(userServiceMock.update).toHaveBeenCalledWith(
        activeEmployee!.id,
        { is_active: false }
      );
      expect(activeEmployee!.is_active).toBe(false);
    }));

    it('should activate inactive employee', fakeAsync(async () => {
      // Behavior: Manager can reactivate an inactive employee
      component.ngOnInit();
      // tick replaced by await

      const inactiveEmployee = component.employees().find(e => !e.is_active);
      expect(inactiveEmployee).toBeTruthy();

      // Mock update to return activated employee
      userServiceMock.update = jest.fn().mockResolvedValue({
        ...inactiveEmployee,
        is_active: true
      });

      await component.toggleEmployeeStatus(inactiveEmployee!);
      // tick replaced by await

      expect(userServiceMock.update).toHaveBeenCalledWith(
        inactiveEmployee!.id,
        { is_active: true }
      );
      expect(inactiveEmployee!.is_active).toBe(true);
    }));

    it('should show success message after status change', fakeAsync(async () => {
      // Behavior: Manager receives confirmation
      component.ngOnInit();
      // tick replaced by await

      const employee = component.employees()[0];
      await component.toggleEmployeeStatus(employee);
      // tick replaced by await

      expect(messageServiceMock.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Éxito',
        detail: expect.stringContaining('correctamente')
      });
    }));

    it('should show error message when status change fails', fakeAsync(async () => {
      // Behavior: Manager is informed of failures
      userServiceMock.update = jest.fn().mockRejectedValue(new Error('Update failed'));
      
      component.ngOnInit();
      // tick replaced by await

      const employee = component.employees()[0];
      await component.toggleEmployeeStatus(employee);
      // tick replaced by await

      expect(messageServiceMock.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo actualizar el estado del empleado'
      });
    }));
  });

  describe('employee cards visual feedback', () => {
    it('should apply visual distinction for inactive employees', async () => {
      // Behavior: Inactive employees are visually distinct
      component.ngOnInit();
      // tick replaced by await
      fixture.detectChanges();

      // Check that inactive class is applied
      const compiled = fixture.nativeElement as HTMLElement;
      const inactiveCards = compiled.querySelectorAll('.inactive');
      
      // Should have at least one inactive card
      expect(inactiveCards.length).toBeGreaterThan(0);
    }));
  });
});