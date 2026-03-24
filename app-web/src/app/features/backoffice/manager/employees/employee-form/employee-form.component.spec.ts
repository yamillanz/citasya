import { ComponentFixture, TestBed, waitForAsync, NO_ERRORS_SCHEMA } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EmployeeFormComponent } from './employee-form.component';
import { AuthService } from '../../../../../core/services/auth.service';
import { UserService } from '../../../../../core/services/user.service';
import { ServiceService } from '../../../../../core/services/service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ReactiveFormsModule } from '@angular/forms';

describe('EmployeeFormComponent - Behavior Driven Tests', () => {
  let component: EmployeeFormComponent;
  let fixture: ComponentFixture<EmployeeFormComponent>;
  let authServiceMock: jest.Mocked<AuthService>;
  let userServiceMock: jest.Mocked<UserService>;
  let serviceServiceMock: jest.Mocked<ServiceService>;
  let router: Router;

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

  const mockEmployee = {
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
  };

  const mockServices = [
    {
      id: 'srv-1',
      name: 'Corte de cabello',
      duration_minutes: 30,
      company_id: 'company-1',
      is_active: true
    },
    {
      id: 'srv-2',
      name: 'Tinte',
      duration_minutes: 60,
      company_id: 'company-1',
      is_active: true
    }
  ];

  beforeEach(waitForAsync(async () => {
    authServiceMock = {
      getCurrentUser: jest.fn().mockResolvedValue(mockUser)
    } as any;

    userServiceMock = {
      getById: jest.fn(),
      create: jest.fn().mockResolvedValue({ ...mockEmployee, id: 'new-emp' }),
      update: jest.fn().mockResolvedValue(mockEmployee)
    } as any;

    serviceServiceMock = {
      getByCompany: jest.fn().mockResolvedValue(mockServices)
    } as any;
  }));

  describe('when creating a new employee', () => {
    beforeEach(waitForAsync(async () => {
      const activatedRouteMock = {
        snapshot: {
          paramMap: {
            get: jest.fn().mockReturnValue('new')
          }
        }
      };

      await TestBed.configureTestingModule({
        imports: [EmployeeFormComponent, ReactiveFormsModule, RouterTestingModule],
        providers: [
          { provide: AuthService, useValue: authServiceMock },
          { provide: UserService, useValue: userServiceMock },
          { provide: ServiceService, useValue: serviceServiceMock },
          { provide: ActivatedRoute, useValue: activatedRouteMock },
          MessageService
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();

      router = TestBed.inject(Router);
      jest.spyOn(router, 'navigate').mockResolvedValue(true);

      fixture = TestBed.createComponent(EmployeeFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      await fixture.whenStable();
    }));

    it('should display "Nuevo Empleado" title', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Nuevo Empleado');
    });

    it('should validate that email is required', () => {
      component.form.patchValue({ full_name: 'Test', email: '' });
      component.markAllAsTouched();
      
      expect(component.form.valid).toBe(false);
      expect(component.emailError).toBe('El email es requerido');
    });

    it('should validate email format', () => {
      component.form.patchValue({ full_name: 'Test', email: 'invalid-email' });
      component.markAllAsTouched();
      
      expect(component.emailError).toBe('El email no es válido');
    });

    it('should validate that full name is required', () => {
      component.form.patchValue({ full_name: '', email: 'test@test.com' });
      component.markAllAsTouched();
      
      expect(component.fullNameError).toBe('El nombre es requerido');
    });

    it('should validate full name minimum length', () => {
      component.form.patchValue({ full_name: 'A', email: 'test@test.com' });
      component.markAllAsTouched();
      
      expect(component.fullNameError).toBe('El nombre debe tener al menos 2 caracteres');
    });

    it('should load available services for assignment', async () => {
      await component.ngOnInit();

      expect(serviceServiceMock.getByCompany).toHaveBeenCalledWith('company-1');
      expect(component.services().length).toBe(2);
    });

    it('should allow selecting services for the employee', async () => {
      await component.ngOnInit();

      component.onServiceToggle('srv-1');
      expect(component.isServiceSelected('srv-1')).toBe(true);

      component.onServiceToggle('srv-1');
      expect(component.isServiceSelected('srv-1')).toBe(false);
    });

    it('should create employee with role employee', async () => {
      component.form.patchValue({
        email: 'new@test.com',
        full_name: 'New Employee',
        phone: '555-000-0000'
      });

      await component.onSubmit();

      const createCall = userServiceMock.create.mock.calls[0][0];
      expect(createCall.role).toBe('employee');
      expect(createCall.company_id).toBe('company-1');
    });

    it('should navigate to employees list after creation', async () => {
      component.form.patchValue({
        email: 'new@test.com',
        full_name: 'New Employee'
      });

      await component.onSubmit();

      expect(router.navigate).toHaveBeenCalledWith(['/bo/employees']);
    });
  });

  describe('when editing an existing employee', () => {
    beforeEach(waitForAsync(async () => {
      userServiceMock.getById = jest.fn().mockResolvedValue(mockEmployee);
      
      const activatedRouteMock = {
        snapshot: {
          paramMap: {
            get: jest.fn().mockReturnValue('emp-1')
          }
        }
      };

      await TestBed.configureTestingModule({
        imports: [EmployeeFormComponent, ReactiveFormsModule, RouterTestingModule],
        providers: [
          { provide: AuthService, useValue: authServiceMock },
          { provide: UserService, useValue: userServiceMock },
          { provide: ServiceService, useValue: serviceServiceMock },
          { provide: ActivatedRoute, useValue: activatedRouteMock },
          MessageService
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();

      router = TestBed.inject(Router);
      jest.spyOn(router, 'navigate').mockResolvedValue(true);

      fixture = TestBed.createComponent(EmployeeFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      await fixture.whenStable();
    }));

    it('should load existing employee data into form', async () => {
      await component.ngOnInit();

      expect(component.form.get('email')?.value).toBe('juan@test.com');
      expect(component.form.get('full_name')?.value).toBe('Juan Pérez');
      expect(component.form.get('phone')?.value).toBe('555-123-4567');
      expect(component.form.get('photo_url')?.value).toBe('https://example.com/juan.jpg');
    });

    it('should update employee with modified data', async () => {
      component.form.patchValue({
        full_name: 'Juan Pérez Actualizado',
        phone: '555-999-9999'
      });

      await component.onSubmit();

      expect(userServiceMock.update).toHaveBeenCalledWith('emp-1', expect.any(Object));
    });

    it('should navigate to employees list after update', async () => {
      component.form.patchValue({ full_name: 'Updated Name' });

      await component.onSubmit();

      expect(router.navigate).toHaveBeenCalledWith(['/bo/employees']);
    });

    it('should navigate to list when employee not found', async () => {
      userServiceMock.getById = jest.fn().mockResolvedValue(null);
      
      await component.ngOnInit();

      expect(router.navigate).toHaveBeenCalledWith(['/bo/employees']);
    });
  });
});
